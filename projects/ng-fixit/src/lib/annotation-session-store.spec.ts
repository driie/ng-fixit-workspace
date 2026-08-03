import { AnnotationSessionStore } from './annotation-session-store';

describe('AnnotationSessionStore', () => {
  let store: AnnotationSessionStore;

  beforeEach(() => {
    store = new AnnotationSessionStore();
  });

  it('adds an Annotation to the list when a non-empty note is committed', () => {
    store.beginCreate({ locatorSummary: 'button' });
    store.commitCreate('Fix the label contrast');

    expect(store.annotations()).toEqual([
      expect.objectContaining({
        note: 'Fix the label contrast',
        locatorSummary: 'button',
      }),
    ]);
    expect(store.draft()).toBeNull();
  });

  it('rejects an empty note and keeps the draft open', () => {
    store.beginCreate({ locatorSummary: 'button' });
    store.commitCreate('   ');

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).not.toBeNull();
  });

  it('abandons create without adding an Annotation when canceled', () => {
    store.beginCreate({ locatorSummary: 'button' });
    store.cancelCreate();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).toBeNull();
  });

  it('accumulates multiple Annotations in session memory', () => {
    store.beginCreate({ locatorSummary: 'button' });
    store.commitCreate('First note');
    store.beginCreate({ locatorSummary: 'span' });
    store.commitCreate('Second note');

    expect(store.annotations().map(annotation => annotation.note)).toEqual([
      'First note',
      'Second note',
    ]);
  });
});
