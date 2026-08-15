import { AnnotationTargetContext, DraftKind } from '../models/annotation';
import { AnnotationMode } from '../models/annotation-mode';
import { HostComponentInfo } from '../models/host-component';
import { Locator } from '../models/locator';
import { AnnotationSessionStore } from './annotation-session-store';

const locatorFixture = (overrides: Partial<Locator> = {}): Locator => {
  return {
    cssPath: 'button',
    boundingBox: { top: 0, left: 0, width: 10, height: 10 },
    ...overrides,
  };
};

const hostComponentFixture = (overrides: Partial<HostComponentInfo> = {}): HostComponentInfo => {
  return {
    name: 'KnownHost',
    selector: 'fixit-known-host',
    ...overrides,
  };
};

const commitAnnotation = (
  store: AnnotationSessionStore,
  note: string,
  targetContext: Partial<AnnotationTargetContext> = {},
): void => {
  store.beginCreate({
    locator: targetContext.locator ?? locatorFixture(),
    ...(targetContext.hostComponent ? { hostComponent: targetContext.hostComponent } : {}),
  });
  store.updateDraftNote(note);
  store.commitDraft();
};

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
    const locator = locatorFixture({ cssPath: 'button.primary' });
    store.beginCreate({ locator });
    store.updateDraftNote('Fix the label contrast');
    store.commitDraft();

    expect(store.annotations()).toEqual([
      expect.objectContaining({
        note: 'Fix the label contrast',
        locator,
      }),
    ]);
    expect(store.draft()).toBeNull();
  });

  it('stores Host Component metadata on the Annotation when provided', () => {
    const locator = locatorFixture({ cssPath: 'button.primary' });
    const hostComponent = hostComponentFixture();
    store.beginCreate({ locator, hostComponent });
    store.updateDraftNote('Fix the host CTA');
    store.commitDraft();

    expect(store.annotations()).toEqual([
      expect.objectContaining({
        note: 'Fix the host CTA',
        locator,
        hostComponent,
      }),
    ]);
  });

  it('omits Host Component on the Annotation when not provided', () => {
    store.beginCreate({ locator: locatorFixture() });
    store.updateDraftNote('Pure DOM target');
    store.commitDraft();

    expect(store.annotations()[0]?.hostComponent).toBeUndefined();
  });

  it('rejects an empty note and keeps the draft open', () => {
    store.beginCreate({ locator: locatorFixture() });
    store.updateDraftNote('   ');
    store.commitDraft();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).not.toBeNull();
    expect(store.draft()?.note).toBe('   ');
  });

  it('abandons create without adding an Annotation when canceled', () => {
    store.beginCreate({ locator: locatorFixture() });
    store.updateDraftNote('Will abandon');
    store.cancelDraft();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).toBeNull();
  });

  it('does not start a second create while a draft is open', () => {
    const first = locatorFixture({ cssPath: 'button' });
    store.beginCreate({ locator: first });
    store.updateDraftNote('First draft');
    store.beginCreate({ locator: locatorFixture({ cssPath: 'span' }) });

    expect(store.draft()).toEqual({
      kind: DraftKind.Create,
      locator: first,
      note: 'First draft',
    });
  });

  it('clears an open draft when leaving Annotation Mode', () => {
    store.enterAnnotationMode();
    store.beginCreate({ locator: locatorFixture() });
    store.updateDraftNote('In flight');
    store.leaveAnnotationMode();

    expect(store.mode()).toBe(AnnotationMode.Off);
    expect(store.draft()).toBeNull();
  });

  it('accumulates multiple Annotations in session memory', () => {
    commitAnnotation(store, 'First note', { locator: locatorFixture({ cssPath: 'button' }) });
    commitAnnotation(store, 'Second note', { locator: locatorFixture({ cssPath: 'span' }) });

    expect(store.annotations().map(annotation => annotation.note)).toEqual([
      'First note',
      'Second note',
    ]);
  });

  it('removes only the requested Annotation and keeps remaining order', () => {
    commitAnnotation(store, 'First note', { locator: locatorFixture({ cssPath: 'button' }) });
    commitAnnotation(store, 'Second note', { locator: locatorFixture({ cssPath: 'span' }) });
    commitAnnotation(store, 'Third note', { locator: locatorFixture({ cssPath: 'div' }) });

    store.deleteAnnotation(store.annotations()[1]!.id);

    expect(store.annotations().map(annotation => annotation.note)).toEqual([
      'First note',
      'Third note',
    ]);
  });

  it('clears all Annotations from the working list', () => {
    commitAnnotation(store, 'First note', { locator: locatorFixture({ cssPath: 'button' }) });
    commitAnnotation(store, 'Second note', { locator: locatorFixture({ cssPath: 'span' }) });

    store.clearAnnotations();

    expect(store.annotations()).toEqual([]);
  });

  it('updates an existing Annotation note without changing Target context', () => {
    const locator = locatorFixture({ cssPath: 'button.primary' });
    const hostComponent = hostComponentFixture();
    commitAnnotation(store, 'Original note', { locator, hostComponent });

    const annotation = store.annotations()[0]!;
    store.beginEdit(annotation.id);
    store.updateDraftNote('Refined note');
    store.commitDraft();

    expect(store.annotations()).toEqual([
      {
        id: annotation.id,
        note: 'Refined note',
        locator,
        hostComponent,
      },
    ]);
    expect(store.draft()).toBeNull();
  });

  it('rejects an empty edit and keeps the original Annotation', () => {
    commitAnnotation(store, 'Original note');

    store.beginEdit(store.annotations()[0]!.id);
    store.updateDraftNote('   ');
    store.commitDraft();

    expect(store.annotations().map(annotation => annotation.note)).toEqual(['Original note']);
    expect(store.draft()).not.toBeNull();
    expect(store.draft()?.note).toBe('   ');
  });

  it('abandons an edit without changing the Annotation when canceled', () => {
    commitAnnotation(store, 'Original note');

    store.beginEdit(store.annotations()[0]!.id);
    store.updateDraftNote('Will abandon');
    store.cancelDraft();

    expect(store.annotations().map(annotation => annotation.note)).toEqual(['Original note']);
    expect(store.draft()).toBeNull();
  });

  it('does not start an edit while a create draft is open', () => {
    commitAnnotation(store, 'First note', { locator: locatorFixture({ cssPath: 'button' }) });

    store.beginCreate({ locator: locatorFixture({ cssPath: 'span' }) });
    store.updateDraftNote('In flight create');
    store.beginEdit(store.annotations()[0]!.id);

    expect(store.draft()).toEqual({
      kind: DraftKind.Create,
      locator: locatorFixture({ cssPath: 'span' }),
      note: 'In flight create',
    });
  });

  it('does not start a create while an edit draft is open', () => {
    const locator = locatorFixture({ cssPath: 'button' });
    commitAnnotation(store, 'Original note', { locator });

    store.beginEdit(store.annotations()[0]!.id);
    store.updateDraftNote('Editing');
    store.beginCreate({ locator: locatorFixture({ cssPath: 'span' }) });

    expect(store.draft()).toEqual({
      kind: DraftKind.Edit,
      id: store.annotations()[0]!.id,
      note: 'Editing',
    });
  });

  it('clears an edit draft when that Annotation is deleted', () => {
    commitAnnotation(store, 'Doomed note');

    const id = store.annotations()[0]!.id;
    store.beginEdit(id);
    store.updateDraftNote('In flight edit');
    store.deleteAnnotation(id);

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).toBeNull();
  });

  it('clears an edit draft when all Annotations are cleared', () => {
    commitAnnotation(store, 'Will be cleared');

    store.beginEdit(store.annotations()[0]!.id);
    store.updateDraftNote('In flight edit');
    store.clearAnnotations();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).toBeNull();
  });

  it('leaves a create draft open when the working list is cleared', () => {
    store.beginCreate({ locator: locatorFixture() });
    store.updateDraftNote('In flight create');
    store.clearAnnotations();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()?.note).toBe('In flight create');
  });

  it('ignores edit and delete for an unknown Annotation id', () => {
    commitAnnotation(store, 'Keep me');

    const before = store.annotations();
    store.beginEdit('missing');
    store.deleteAnnotation('missing');

    expect(store.annotations()).toEqual(before);
    expect(store.draft()).toBeNull();
  });
});
