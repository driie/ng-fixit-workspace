import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';

import { NoteEntry } from '../note-entry/note-entry';
import { DraftKind } from '../../models/annotation';
import { AnnotationSessionStore } from '../../services/annotation-session-store';
import { targetSelectorFromCssPath } from '../../utils/target-selector';

@Component({
  selector: 'fixit-annotation-list',
  imports: [NoteEntry],
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
  protected readonly editingId = computed<string | null>(() => {
    const draft = this.annotationSessionStore.draft();
    return draft?.kind === DraftKind.Edit ? draft.id : null;
  });
  protected readonly targetSelectors = computed<Readonly<Record<string, string>>>(() =>
    Object.fromEntries(
      this.annotations().map(annotation => [
        annotation.id,
        targetSelectorFromCssPath(annotation.locator.cssPath),
      ]),
    ),
  );
  readonly copyReportRequested = output<void>();
  readonly targetHovered = output<string | null>();

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
