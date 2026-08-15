import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AnnotationSessionStore } from '../../services/annotation-session-store';

@Component({
  selector: 'fixit-annotation-list',
  templateUrl: './annotation-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: contents',
  },
})
export class AnnotationList {
  private readonly annotationSessionStore = inject(AnnotationSessionStore);

  protected readonly annotations = this.annotationSessionStore.annotations;
  protected readonly hasAnnotations = computed<boolean>(() => this.annotations().length > 0);

  beginEdit(id: string): void {
    this.annotationSessionStore.beginEdit(id);
  }

  deleteAnnotation(id: string): void {
    this.annotationSessionStore.deleteAnnotation(id);
  }

  clearAnnotations(): void {
    this.annotationSessionStore.clearAnnotations();
  }
}
