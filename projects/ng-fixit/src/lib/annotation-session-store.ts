import { computed, Injectable, signal } from '@angular/core';

import { Annotation, AnnotationCreateTarget, AnnotationDraft } from './annotation';

@Injectable()
export class AnnotationSessionStore {
  private readonly annotationsState = signal<readonly Annotation[]>([]);
  private readonly draftState = signal<AnnotationDraft | null>(null);
  private nextId = 1;

  readonly annotations = computed<readonly Annotation[]>(() => this.annotationsState());
  readonly draft = computed<AnnotationDraft | null>(() => this.draftState());

  beginCreate(target: AnnotationCreateTarget): void {
    this.draftState.set({
      locatorSummary: target.locatorSummary,
    });
  }

  commitCreate(note: string): void {
    const draft = this.draftState();
    if (!draft) {
      return;
    }

    const trimmedNote = note.trim();
    if (trimmedNote.length === 0) {
      return;
    }

    this.annotationsState.update(annotations => [
      ...annotations,
      {
        id: String(this.nextId++),
        note: trimmedNote,
        locatorSummary: draft.locatorSummary,
      },
    ]);
    this.draftState.set(null);
  }

  cancelCreate(): void {
    this.draftState.set(null);
  }
}
