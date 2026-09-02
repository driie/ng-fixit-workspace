import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  InjectionToken,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';

import { AnnotationList } from '../../components/annotation-list/annotation-list';
import { CopyToast } from '../../components/copy-toast/copy-toast';
import { NoteEntry } from '../../components/note-entry/note-entry';
import { DraftKind } from '../../models/annotation';
import { AnnotationMode } from '../../models/annotation-mode';
import {
  NoteEntryPosition,
  PointerTarget,
  PointerTargetKind,
  TargetHighlightBox,
} from '../../models/target-overlay';
import { AnnotationSessionStore } from '../../services/annotation-session-store';
import { writeClipboardText } from '../../utils/clipboard';
import { discoverHostComponent } from '../../utils/host-component';
import { captureLocator } from '../../utils/locator';
import { buildReportMarkdown } from '../../utils/report-builder';
import {
  highlightBoxFromElement,
  noteEntryPositionFromElement,
  resolvePointerTarget,
  targetLabelFromElement,
} from '../../utils/target-highlight';

export const NG_FIXIT_ENABLED = new InjectionToken<boolean>('NG_FIXIT_ENABLED', {
  providedIn: 'root',
  factory: (): boolean => isDevMode(),
});

@Component({
  selector: 'ng-fixit',
  imports: [AnnotationList, CopyToast, NoteEntry],
  templateUrl: './ng-fixit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AnnotationSessionStore],
  host: {
    class: 'fixit-root',
    '[attr.data-fixit-annotation-mode]': 'annotationMode()',
    '(document:pointermove)': 'trackPointerTarget($event)',
    '(document:keydown.escape)': 'cancelDraftOrLeaveAnnotationMode($event)',
    '(window:resize)': 'refreshTargetHighlight()',
  },
})
export class NgFixit {
  private readonly annotationSessionStore = inject(AnnotationSessionStore);
  private readonly libraryEnabled = inject(NG_FIXIT_ENABLED);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly pointerTarget = signal<PointerTarget | null>(null);
  private readonly hoveredAnnotationTarget = signal<Element | null>(null);
  private readonly highlightLayoutEpoch = signal<number>(0);
  private readonly copyToast = viewChild(CopyToast);

  protected readonly enabled = this.libraryEnabled;
  protected readonly annotationMode = this.annotationSessionStore.mode;
  protected readonly draft = this.annotationSessionStore.draft;
  protected readonly annotationModePressed = computed<boolean>(
    () => this.annotationMode() === AnnotationMode.On,
  );
  protected readonly highlightLocked = computed<boolean>(
    () => this.draft()?.kind === DraftKind.Create,
  );
  protected readonly hasAnnotations = computed<boolean>(
    () => this.annotationSessionStore.annotations().length > 0,
  );
  protected readonly targetHighlightBox = computed<TargetHighlightBox | null>(() => {
    this.highlightLayoutEpoch();

    if (!this.annotationModePressed()) {
      return null;
    }

    const target = this.hoveredAnnotationTarget() ?? this.pointerTarget()?.element;
    if (!target) {
      return null;
    }

    return highlightBoxFromElement(target);
  });
  protected readonly targetLabel = computed<string | null>(() => {
    if (!this.annotationModePressed()) {
      return null;
    }

    const target = this.hoveredAnnotationTarget() ?? this.pointerTarget()?.element;
    return target ? targetLabelFromElement(target) : null;
  });
  protected readonly noteEntryPosition = computed<NoteEntryPosition | null>(() => {
    this.highlightLayoutEpoch();

    if (this.draft()?.kind !== DraftKind.Create) {
      return null;
    }

    const target = this.pointerTarget()?.element;
    const view = this.document.defaultView;
    if (!target || !view) {
      return null;
    }

    return noteEntryPositionFromElement(target, view.innerWidth, view.innerHeight);
  });

  toggleAnnotationMode(): void {
    if (!this.libraryEnabled) {
      return;
    }

    if (this.annotationMode() === AnnotationMode.On) {
      this.leaveAnnotationMode();
      return;
    }

    this.annotationSessionStore.enterAnnotationMode();
  }

  cancelDraftOrLeaveAnnotationMode(event: Event): void {
    if (this.draft()) {
      event.preventDefault();
      event.stopPropagation();
      this.annotationSessionStore.cancelDraft();
      return;
    }

    this.leaveAnnotationMode(event);
  }

  leaveAnnotationMode(event?: Event): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    event?.preventDefault();
    event?.stopPropagation();
    this.annotationSessionStore.leaveAnnotationMode();
    this.pointerTarget.set(null);
  }

  copyReport(): void {
    if (!this.libraryEnabled) {
      return;
    }

    const markdown = buildReportMarkdown(this.annotationSessionStore.annotations());
    writeClipboardText(this.document.defaultView, markdown);
    this.copyToast()?.show();
  }

  highlightAnnotationTarget(cssPath: string | null): void {
    this.hoveredAnnotationTarget.set(cssPath ? this.document.querySelector(cssPath) : null);
  }

  trackPointerTarget(event: PointerEvent): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    if (this.draft()?.kind === DraftKind.Create) {
      return;
    }

    const nextTarget = resolvePointerTarget(event.target);
    const current = this.pointerTarget();
    if (nextTarget?.element === current?.element && nextTarget?.kind === current?.kind) {
      return;
    }

    this.pointerTarget.set(nextTarget);
  }

  private selectTarget(event: Event): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    const resolved = resolvePointerTarget(event.target);
    if (resolved?.kind !== PointerTargetKind.Target) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.draft()) {
      return;
    }

    this.pointerTarget.set(resolved);
    this.annotationSessionStore.beginCreate({
      locator: captureLocator(resolved.element),
      hostComponent: discoverHostComponent(resolved.element),
    });
  }

  refreshTargetHighlight(): void {
    if (!this.pointerTarget()) {
      return;
    }

    this.highlightLayoutEpoch.update(epoch => epoch + 1);
  }

  constructor() {
    const refreshOnScroll = (): void => {
      this.refreshTargetHighlight();
    };

    const selectTarget = (event: Event): void => {
      this.selectTarget(event);
    };

    this.document.addEventListener('scroll', refreshOnScroll, true);
    this.document.addEventListener('click', selectTarget, true);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('scroll', refreshOnScroll, true);
      this.document.removeEventListener('click', selectTarget, true);
    });
  }

  protected readonly DraftKind = DraftKind;
}
