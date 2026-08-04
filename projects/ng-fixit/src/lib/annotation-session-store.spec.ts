import { AnnotationMode } from './annotation-mode';
import { AnnotationSessionStore } from './annotation-session-store';
import { HostComponentInfo } from './host-component';
import { Locator } from './locator';

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
    store.commitCreate();

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
    store.commitCreate();

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
    store.commitCreate();

    expect(store.annotations()[0]?.hostComponent).toBeUndefined();
  });

  it('rejects an empty note and keeps the draft open', () => {
    store.beginCreate({ locator: locatorFixture() });
    store.updateDraftNote('   ');
    store.commitCreate();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).not.toBeNull();
    expect(store.draft()?.note).toBe('   ');
  });

  it('abandons create without adding an Annotation when canceled', () => {
    store.beginCreate({ locator: locatorFixture() });
    store.updateDraftNote('Will abandon');
    store.cancelCreate();

    expect(store.annotations()).toEqual([]);
    expect(store.draft()).toBeNull();
  });

  it('does not start a second create while a draft is open', () => {
    const first = locatorFixture({ cssPath: 'button' });
    store.beginCreate({ locator: first });
    store.updateDraftNote('First draft');
    store.beginCreate({ locator: locatorFixture({ cssPath: 'span' }) });

    expect(store.draft()).toEqual({
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
    store.beginCreate({ locator: locatorFixture({ cssPath: 'button' }) });
    store.updateDraftNote('First note');
    store.commitCreate();
    store.beginCreate({ locator: locatorFixture({ cssPath: 'span' }) });
    store.updateDraftNote('Second note');
    store.commitCreate();

    expect(store.annotations().map(annotation => annotation.note)).toEqual([
      'First note',
      'Second note',
    ]);
  });
});
