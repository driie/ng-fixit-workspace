import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  isDevMode,
  signal,
} from '@angular/core';

import { AnnotationMode } from './annotation-mode';
import { AnnotationModeStore } from './annotation-mode-store';
import { AnnotationSessionStore } from './annotation-session-store';
import {
  highlightBoxFromElement,
  resolvePointerTarget,
  TargetHighlightBox,
} from './target-highlight';

export const NG_FIXIT_ENABLED = new InjectionToken<boolean>('NG_FIXIT_ENABLED', {
  providedIn: 'root',
  factory: (): boolean => isDevMode(),
});

@Component({
  selector: 'ng-fixit',
  templateUrl: './ng-fixit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AnnotationModeStore, AnnotationSessionStore],
  host: {
    class: 'fixit-root',
    '[attr.data-fixit-annotation-mode]': 'annotationMode()',
    '(document:pointermove)': 'trackPointerTarget($event)',
    '(document:click)': 'selectTarget($event)',
  },
})
export class NgFixit {
  private readonly annotationModeStore = inject(AnnotationModeStore);
  private readonly annotationSessionStore = inject(AnnotationSessionStore);
  private readonly libraryEnabled = inject(NG_FIXIT_ENABLED);

  private readonly hoveredTarget = signal<Element | null>(null);
  private readonly draftNoteState = signal<string>('');

  protected readonly enabled = this.libraryEnabled;
  protected readonly annotationMode = this.annotationModeStore.mode;
  protected readonly draft = this.annotationSessionStore.draft;
  protected readonly annotations = this.annotationSessionStore.annotations;
  protected readonly draftNote = computed<string>(() => this.draftNoteState());
  protected readonly annotationModePressed = computed<boolean>(
    () => this.annotationMode() === AnnotationMode.On,
  );
  protected readonly targetHighlightBox = computed<TargetHighlightBox | null>(() => {
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

    this.annotationModeStore.toggleAnnotationMode();

    if (this.annotationMode() === AnnotationMode.Off) {
      this.hoveredTarget.set(null);
      this.abandonCreate();
    }
  }

  trackPointerTarget(event: PointerEvent): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    this.hoveredTarget.set(resolvePointerTarget(event.target));
  }

  selectTarget(event: MouseEvent): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    if (this.draft()) {
      return;
    }

    const target = resolvePointerTarget(event.target);
    if (!target) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.draftNoteState.set('');
    this.annotationSessionStore.beginCreate({
      locatorSummary: target.tagName.toLowerCase(),
    });
  }

  updateDraftNote(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    this.draftNoteState.set(target.value);
  }

  commitAnnotation(): void {
    this.annotationSessionStore.commitCreate(this.draftNote());
    if (!this.draft()) {
      this.draftNoteState.set('');
    }
  }

  cancelAnnotation(): void {
    this.abandonCreate();
  }

  private abandonCreate(): void {
    this.annotationSessionStore.cancelCreate();
    this.draftNoteState.set('');
  }

  protected readonly AnnotationMode = AnnotationMode;
}
