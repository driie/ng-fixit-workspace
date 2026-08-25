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
} from '@angular/core';

import { AnnotationList } from '../../components/annotation-list/annotation-list';
import { NoteEntry } from '../../components/note-entry/note-entry';
import { DraftKind } from '../../models/annotation';
import { AnnotationMode } from '../../models/annotation-mode';
import { AnnotationSessionStore } from '../../services/annotation-session-store';
import { writeClipboardText } from '../../utils/clipboard';
import { discoverHostComponent } from '../../utils/host-component';
import { captureLocator } from '../../utils/locator';
import { buildReportMarkdown } from '../../utils/report-builder';
import {
  highlightBoxFromElement,
  resolvePointerTarget,
  TargetHighlightBox,
} from '../../utils/target-highlight';

export const NG_FIXIT_ENABLED = new InjectionToken<boolean>('NG_FIXIT_ENABLED', {
  providedIn: 'root',
  factory: (): boolean => isDevMode(),
});

@Component({
  selector: 'ng-fixit',
  imports: [AnnotationList, NoteEntry],
  templateUrl: './ng-fixit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AnnotationSessionStore],
  host: {
    class: 'fixit-root',
    '[attr.data-fixit-annotation-mode]': 'annotationMode()',
    '(document:pointermove)': 'trackPointerTarget($event)',
    '(window:resize)': 'refreshTargetHighlight()',
  },
})
export class NgFixit {
  private readonly annotationSessionStore = inject(AnnotationSessionStore);
  private readonly libraryEnabled = inject(NG_FIXIT_ENABLED);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly hoveredTarget = signal<Element | null>(null);
  private readonly highlightLayoutEpoch = signal<number>(0);

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

    const target = this.hoveredTarget();
    if (!target) {
      return null;
    }

    return highlightBoxFromElement(target);
  });

  toggleAnnotationMode(): void {
    if (!this.libraryEnabled) {
      return;
    }

    this.annotationSessionStore.toggleAnnotationMode();

    if (this.annotationMode() === AnnotationMode.Off) {
      this.hoveredTarget.set(null);
    }
  }

  copyReport(): void {
    if (!this.libraryEnabled) {
      return;
    }

    const markdown = buildReportMarkdown(this.annotationSessionStore.annotations());
    writeClipboardText(this.document.defaultView, markdown);
  }

  trackPointerTarget(event: PointerEvent): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    if (this.draft()?.kind === DraftKind.Create) {
      return;
    }

    const nextTarget = resolvePointerTarget(event.target);
    if (nextTarget === this.hoveredTarget()) {
      return;
    }

    this.hoveredTarget.set(nextTarget);
  }

  private selectTarget(event: Event): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    const target = resolvePointerTarget(event.target);
    if (!target) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.draft()) {
      return;
    }

    this.hoveredTarget.set(target);
    this.annotationSessionStore.beginCreate({
      locator: captureLocator(target),
      hostComponent: discoverHostComponent(target),
    });
  }

  refreshTargetHighlight(): void {
    if (!this.hoveredTarget()) {
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
}
