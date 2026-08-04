import { computed, Injectable, signal } from '@angular/core';

import { Annotation, AnnotationDraft } from './annotation';
import { AnnotationMode } from './annotation-mode';
import { Locator } from './locator';

@Injectable()
export class AnnotationSessionStore {
  private readonly modeState = signal<AnnotationMode>(AnnotationMode.Off);
  private readonly annotationsState = signal<readonly Annotation[]>([]);
  private readonly draftState = signal<AnnotationDraft | null>(null);
  private nextId = 1;

  readonly mode = computed<AnnotationMode>(() => this.modeState());
  readonly annotations = computed<readonly Annotation[]>(() => this.annotationsState());
  readonly draft = computed<AnnotationDraft | null>(() => this.draftState());

  enterAnnotationMode(): void {
    this.modeState.set(AnnotationMode.On);
  }

  leaveAnnotationMode(): void {
    this.modeState.set(AnnotationMode.Off);
    this.draftState.set(null);
  }

  toggleAnnotationMode(): void {
    if (this.modeState() === AnnotationMode.On) {
      this.leaveAnnotationMode();
      return;
    }

    this.enterAnnotationMode();
  }

  beginCreate(locator: Locator): void {
    if (this.draftState() !== null) {
      return;
    }

    this.draftState.set({
      locator,
      note: '',
    });
  }

  updateDraftNote(note: string): void {
    this.draftState.update(draft => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        note,
      };
    });
  }

  commitCreate(): void {
    const draft = this.draftState();
    if (!draft) {
      return;
    }

    const trimmedNote = draft.note.trim();
    if (trimmedNote.length === 0) {
      return;
    }

    this.annotationsState.update(annotations => [
      ...annotations,
      {
        id: String(this.nextId++),
        note: trimmedNote,
        locator: draft.locator,
      },
    ]);
    this.draftState.set(null);
  }

  cancelCreate(): void {
    this.draftState.set(null);
  }
}
