import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
}
