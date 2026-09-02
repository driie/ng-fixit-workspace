import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationSessionStore } from '../../services/annotation-session-store';
import { AnnotationList } from './annotation-list';

describe('AnnotationList', () => {
  let fixture: ComponentFixture<AnnotationList>;
  let store: AnnotationSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotationList],
      providers: [AnnotationSessionStore],
    }).compileComponents();

    store = TestBed.inject(AnnotationSessionStore);
    fixture = TestBed.createComponent(AnnotationList);
    fixture.detectChanges();
  });

  it('removes only the selected Annotation', () => {
    addAnnotation('#first', 'First note');
    addAnnotation('#second', 'Second note');

    deleteButtons()[0]?.click();
    fixture.detectChanges();

    expect(annotationNotes()).toEqual(['Second note']);
  });

  it('clears all Annotations', () => {
    addAnnotation('#first', 'First note');
    addAnnotation('#second', 'Second note');

    clearButton().click();
    fixture.detectChanges();

    expect(annotationNotes()).toEqual([]);
  });

  it('updates an Annotation note after editing is committed', async () => {
    addAnnotation('#target', 'Original note');

    expect(annotationNoteButtons()[0]?.getAttribute('aria-label')).toBe('Edit note: Original note');
    expect(deleteButtons()[0]?.getAttribute('aria-label')).toBe('Delete annotation: Original note');

    annotationNoteButtons()[0]?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(noteInput().value).toBe('Original note');

    setNoteInputValue('Refined note');
    commitButton().click();
    fixture.detectChanges();

    expect(annotationNotes()).toEqual(['Refined note']);
    expect(noteEntry()).toBeNull();
  });

  it('starts inline editing when the Annotation card is clicked', async () => {
    addAnnotation('#target', 'Original note');

    annotationItems()[0]?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(noteInput().value).toBe('Original note');
    expect(noteEntry()?.closest('[data-testid="fixit-annotation-list-item"]')).not.toBeNull();
  });

  it('keeps the original note when editing is canceled', async () => {
    addAnnotation('#target', 'Original note');

    annotationNoteButtons()[0]?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    setNoteInputValue('Will abandon');
    cancelButton().click();
    fixture.detectChanges();

    expect(annotationNotes()).toEqual(['Original note']);
    expect(noteEntry()).toBeNull();
  });

  it('keeps an empty edit open without changing the Annotation', async () => {
    addAnnotation('#target', 'Original note');

    annotationNoteButtons()[0]?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    setNoteInputValue('   ');
    commitButton().click();
    fixture.detectChanges();

    expect(noteEntry()).not.toBeNull();

    cancelButton().click();
    fixture.detectChanges();

    expect(annotationNotes()).toEqual(['Original note']);
  });

  const addAnnotation = (cssPath: string, note: string): void => {
    store.beginCreate({
      locator: {
        cssPath,
        boundingBox: { top: 0, left: 0, width: 100, height: 40 },
      },
    });
    store.updateDraftNote(note);
    store.commitDraft();
    fixture.detectChanges();
  };

  const annotationItems = (): HTMLLIElement[] => {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="fixit-annotation-list-item"]'),
    );
  };

  const annotationNoteButtons = (): HTMLButtonElement[] => {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="fixit-annotation-list-note"]'),
    );
  };

  const annotationNotes = (): string[] => {
    return annotationNoteButtons().map(button => button.textContent?.trim() ?? '');
  };

  const deleteButtons = (): HTMLButtonElement[] => {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="fixit-annotation-list-delete"]'),
    );
  };

  const clearButton = (): HTMLButtonElement => {
    return fixture.nativeElement.querySelector(
      '[data-testid="fixit-annotation-list-clear"]',
    ) as HTMLButtonElement;
  };

  const noteEntry = (): HTMLElement | null => {
    return fixture.nativeElement.querySelector('[data-testid="fixit-note-entry"]');
  };

  const noteInput = (): HTMLTextAreaElement => {
    return fixture.nativeElement.querySelector(
      '[data-testid="fixit-note-entry-input"]',
    ) as HTMLTextAreaElement;
  };

  const setNoteInputValue = (value: string): void => {
    const input = noteInput();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };

  const commitButton = (): HTMLButtonElement => {
    return fixture.nativeElement.querySelector(
      '[data-testid="fixit-note-entry-commit"]',
    ) as HTMLButtonElement;
  };

  const cancelButton = (): HTMLButtonElement => {
    return fixture.nativeElement.querySelector(
      '[data-testid="fixit-note-entry-cancel"]',
    ) as HTMLButtonElement;
  };
});
