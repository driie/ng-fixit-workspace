import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationSessionStore } from '../../services/annotation-session-store';
import { NoteEntry } from './note-entry';

describe('NoteEntry', () => {
  let fixture: ComponentFixture<NoteEntry>;
  let store: AnnotationSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteEntry],
      providers: [AnnotationSessionStore],
    }).compileComponents();

    store = TestBed.inject(AnnotationSessionStore);
    store.beginCreate({
      locator: {
        cssPath: '#target',
        boundingBox: { top: 0, left: 0, width: 100, height: 40 },
      },
    });
    fixture = TestBed.createComponent(NoteEntry);
    await fixture.whenStable();
  });

  it('starts the note textarea as one line', () => {
    expect(noteInput().rows).toBe(1);
  });

  it('groups note controls without declaring a modal dialog', () => {
    expect(fixture.nativeElement.getAttribute('role')).toBe('group');
    expect(fixture.nativeElement.getAttribute('aria-modal')).toBeNull();
    expect(fixture.nativeElement.getAttribute('aria-labelledby')).toBe('fixit-note-entry-label');
  });

  it('labels the compact note actions', () => {
    const commit = fixture.nativeElement.querySelector(
      '[data-testid="fixit-note-entry-commit"]',
    ) as HTMLButtonElement;
    const cancel = fixture.nativeElement.querySelector(
      '[data-testid="fixit-note-entry-cancel"]',
    ) as HTMLButtonElement;

    expect(commit.getAttribute('aria-label')).toBe('Save note');
    expect(cancel.getAttribute('aria-label')).toBe('Cancel note');
    expect(commit.querySelector('svg')).not.toBeNull();
    expect(cancel.querySelector('svg')).not.toBeNull();
  });

  it('grows the note textarea height to fit its content', () => {
    const input = noteInput();
    Object.defineProperty(input, 'scrollHeight', {
      configurable: true,
      value: 72,
    });

    input.value = 'A note that wraps onto more than one visual line';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(input.style.height).toBe('72px');
    expect(store.draft()?.note).toBe('A note that wraps onto more than one visual line');
  });

  const noteInput = (): HTMLTextAreaElement => {
    return fixture.nativeElement.querySelector(
      '[data-testid="fixit-note-entry-input"]',
    ) as HTMLTextAreaElement;
  };
});
