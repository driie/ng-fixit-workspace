import { AnnotationMode } from './annotation-mode';
import { AnnotationSessionStore } from './annotation-session-store';

describe('AnnotationSessionStore', () => {
  let store: AnnotationSessionStore;

  beforeEach(() => {
    store = new AnnotationSessionStore();
  });

  it('starts with Annotation Mode off and no draft', () => {
    expect(store.mode()).toBe(AnnotationMode.Off);
    expect(store.draft()).toBeNull();
    expect(store.annotations()).toEqual([]);
  });

  it('toggles Annotation Mode on and off', () => {
    store.toggleAnnotationMode();
    expect(store.mode()).toBe(AnnotationMode.On);

    store.toggleAnnotationMode();
    expect(store.mode()).toBe(AnnotationMode.Off);
  });

  it('adds an Annotation to the list when a non-empty note is committed', () => {
    store.beginCreate('button');
    store.updateDraftNote('Fix the label contrast');
    store.commitCreate();

    expect(store.annotations()).toEqual([
      expect.objectContaining({
        note: 'Fix the label contrast',
        locatorSummary: 'button',
      }),
    ]);
    expect(store.draft()).toBeNull();
  });

  it('rejects an empty note and keeps the draft open', () => {
    store.beginCreate('button');
    store.updateDraftNote('   ');
    store.commitCreate();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).not.toBeNull();
    expect(store.draft()?.note).toBe('   ');
  });

  it('abandons create without adding an Annotation when canceled', () => {
    store.beginCreate('button');
    store.updateDraftNote('Will abandon');
    store.cancelCreate();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).toBeNull();
  });

  it('does not start a second create while a draft is open', () => {
    store.beginCreate('button');
    store.updateDraftNote('First draft');
    store.beginCreate('span');

    expect(store.draft()).toEqual({
      locatorSummary: 'button',
      note: 'First draft',
    });
  });

  it('clears an open draft when leaving Annotation Mode', () => {
    store.enterAnnotationMode();
    store.beginCreate('button');
    store.updateDraftNote('In flight');
    store.leaveAnnotationMode();

    expect(store.mode()).toBe(AnnotationMode.Off);
    expect(store.draft()).toBeNull();
  });

  it('accumulates multiple Annotations in session memory', () => {
    store.beginCreate('button');
    store.updateDraftNote('First note');
    store.commitCreate();
    store.beginCreate('span');
    store.updateDraftNote('Second note');
    store.commitCreate();

    expect(store.annotations().map(annotation => annotation.note)).toEqual([
      'First note',
      'Second note',
    ]);
  });
});
