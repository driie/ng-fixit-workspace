import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';

import { AnnotationSessionStore } from '../../services/annotation-session-store';

@Component({
  selector: 'fixit-note-entry',
  templateUrl: './note-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixit-note-entry',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'fixit-note-entry-label',
    'data-fixit-chrome': '',
    'data-testid': 'fixit-note-entry',
    '(document:keydown.escape)': 'cancelAnnotation()',
  },
})
export class NoteEntry {
  private readonly annotationSessionStore = inject(AnnotationSessionStore);

  private readonly noteInput = viewChild<ElementRef<HTMLTextAreaElement>>('noteInput');

  protected readonly draftNote = computed<string>(
    () => this.annotationSessionStore.draft()?.note ?? '',
  );

  constructor() {
    afterNextRender(() => {
      this.noteInput()?.nativeElement.focus();
    });
  }

  updateDraftNote(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    this.annotationSessionStore.updateDraftNote(target.value);
  }

  commitIfEnter(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.commitAnnotation();
  }

  commitAnnotation(): void {
    this.annotationSessionStore.commitDraft();
  }

  cancelAnnotation(): void {
    this.annotationSessionStore.cancelDraft();
  }
}
