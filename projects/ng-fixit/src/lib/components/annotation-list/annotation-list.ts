import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AnnotationSessionStore } from '../../services/annotation-session-store';

@Component({
  selector: 'fixit-annotation-list',
  templateUrl: './annotation-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixit-annotation-list',
    'data-fixit-chrome': '',
    'data-testid': 'fixit-annotation-list',
  },
})
export class AnnotationList {
  private readonly annotationSessionStore = inject(AnnotationSessionStore);

  protected readonly annotations = this.annotationSessionStore.annotations;

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
