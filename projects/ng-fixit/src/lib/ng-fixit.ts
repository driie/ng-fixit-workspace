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
  providers: [AnnotationModeStore],
  host: {
    class: 'fixit-root',
    '[attr.data-fixit-annotation-mode]': 'annotationMode()',
    '(document:pointermove)': 'trackPointerTarget($event)',
  },
})
export class NgFixit {
  private readonly annotationModeStore = inject(AnnotationModeStore);
  private readonly libraryEnabled = inject(NG_FIXIT_ENABLED);

  private readonly hoveredTarget = signal<Element | null>(null);

  protected readonly enabled = this.libraryEnabled;
  protected readonly annotationMode = this.annotationModeStore.mode;
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
    }
  }

  trackPointerTarget(event: PointerEvent): void {
    if (!this.libraryEnabled || this.annotationMode() !== AnnotationMode.On) {
      return;
    }

    this.hoveredTarget.set(resolvePointerTarget(event.target));
  }

  protected readonly AnnotationMode = AnnotationMode;
}
