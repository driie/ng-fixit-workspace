import { computed, Injectable, signal } from '@angular/core';

import { AnnotationMode } from './annotation-mode';

@Injectable()
export class AnnotationModeStore {
  private readonly modeState = signal<AnnotationMode>(AnnotationMode.Off);

  readonly mode = computed<AnnotationMode>(() => this.modeState());

  enterAnnotationMode(): void {
    this.modeState.set(AnnotationMode.On);
  }

  leaveAnnotationMode(): void {
    this.modeState.set(AnnotationMode.Off);
  }

  toggleAnnotationMode(): void {
    if (this.modeState() === AnnotationMode.On) {
      this.leaveAnnotationMode();
      return;
    }

    this.enterAnnotationMode();
  }
}
