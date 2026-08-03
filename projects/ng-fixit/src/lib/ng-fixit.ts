import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  isDevMode,
} from '@angular/core';

import { AnnotationMode } from './annotation-mode';
import { AnnotationModeStore } from './annotation-mode-store';

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
  },
})
export class NgFixit {
  private readonly annotationModeStore = inject(AnnotationModeStore);
  private readonly libraryEnabled = inject(NG_FIXIT_ENABLED);

  protected readonly enabled = this.libraryEnabled;
  protected readonly annotationMode = this.annotationModeStore.mode;
  protected readonly annotationModePressed = computed<boolean>(
    () => this.annotationMode() === AnnotationMode.On,
  );

  toggleAnnotationMode(): void {
    if (!this.libraryEnabled) {
      return;
    }

    this.annotationModeStore.toggleAnnotationMode();
  }

  protected readonly AnnotationMode = AnnotationMode;
}
