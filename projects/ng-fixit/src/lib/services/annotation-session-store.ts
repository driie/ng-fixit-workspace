import { computed, Injectable, signal } from '@angular/core';

import {
  Annotation,
  AnnotationDraft,
  AnnotationTargetContext,
  DraftKind,
} from '../models/annotation';
import { AnnotationMode } from '../models/annotation-mode';

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

  beginCreate(targetContext: AnnotationTargetContext): void {
    if (this.draftState() !== null) {
      return;
    }

    this.draftState.set({
      kind: DraftKind.Create,
      ...targetContext,
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

  commitDraft(): void {
    const draft = this.draftState();
    if (!draft) {
      return;
    }

    const trimmedNote = draft.note.trim();
    if (trimmedNote.length === 0) {
      return;
    }

    if (draft.kind === DraftKind.Edit) {
      this.annotationsState.update(annotations =>
        annotations.map(annotation => {
          if (annotation.id !== draft.id) {
            return annotation;
          }

          return {
            ...annotation,
            note: trimmedNote,
          };
        }),
      );
    } else {
      const { kind: _discardedKind, note: _discardedNote, ...targetContext } = draft;
      this.annotationsState.update(annotations => [
        ...annotations,
        {
          id: String(this.nextId++),
          note: trimmedNote,
          ...targetContext,
        },
      ]);
    }

    this.draftState.set(null);
  }

  cancelDraft(): void {
    this.draftState.set(null);
  }

  beginEdit(id: string): void {
    if (this.draftState() !== null) {
      return;
    }

    const annotation = this.annotationsState().find(item => item.id === id);
    if (!annotation) {
      return;
    }

    this.draftState.set({
      kind: DraftKind.Edit,
      id: annotation.id,
      note: annotation.note,
    });
  }

  deleteAnnotation(id: string): void {
    this.annotationsState.update(annotations =>
      annotations.filter(annotation => annotation.id !== id),
    );

    const draft = this.draftState();
    if (draft?.kind === DraftKind.Edit && draft.id === id) {
      this.draftState.set(null);
    }
  }

  clearAnnotations(): void {
    this.annotationsState.set([]);

    if (this.draftState()?.kind === DraftKind.Edit) {
      this.draftState.set(null);
    }
  }
}
