import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NG_FIXIT_ENABLED, NgFixit } from './ng-fixit';

@Component({
  imports: [NgFixit],
  template: `
    <div data-testid="host-panel">
      <span data-testid="host-nested">Nested</span>
    </div>
    <button type="button" data-testid="host-button" (click)="hostClicks = hostClicks + 1">
      Host
    </button>
    <ng-fixit />
  `,
})
class HostWithNgFixit {
  hostClicks = 0;
}

describe('NgFixit', () => {
  let fixture: ComponentFixture<NgFixit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgFixit, HostWithNgFixit],
    }).compileComponents();

    fixture = TestBed.createComponent(NgFixit);
    await fixture.whenStable();
  });

  it('shows Annotation Mode toggle chrome when mounted', () => {
    const toggle = fixture.nativeElement.querySelector(
      '[data-testid="fixit-annotation-mode-toggle"]',
    );

    expect(toggle).not.toBeNull();
  });

  it('starts with Annotation Mode off', () => {
    const toggle = annotationModeToggle(fixture);

    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.getAttribute('data-fixit-annotation-mode')).toBe('off');
  });

  it('turns Annotation Mode on when the toggle is activated', async () => {
    annotationModeToggle(fixture).click();
    await fixture.whenStable();

    expect(annotationModeToggle(fixture).getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.getAttribute('data-fixit-annotation-mode')).toBe('on');
  });

  it('turns Annotation Mode off when the toggle is activated again', async () => {
    annotationModeToggle(fixture).click();
    await fixture.whenStable();
    annotationModeToggle(fixture).click();
    await fixture.whenStable();

    expect(annotationModeToggle(fixture).getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.getAttribute('data-fixit-annotation-mode')).toBe('off');
  });

  it('lets host content receive clicks when Annotation Mode is off', async () => {
    const hostFixture = TestBed.createComponent(HostWithNgFixit);
    await hostFixture.whenStable();

    hostButton(hostFixture).click();
    await hostFixture.whenStable();

    expect(hostFixture.componentInstance.hostClicks).toBe(1);
  });

  it('keeps Annotation Mode in memory only', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    annotationModeToggle(fixture).click();
    await fixture.whenStable();
    annotationModeToggle(fixture).click();
    await fixture.whenStable();

    expect(setItem).not.toHaveBeenCalled();

    setItem.mockRestore();
  });
});

describe('NgFixit Target hover highlight', () => {
  let hostFixture: ComponentFixture<HostWithNgFixit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostWithNgFixit],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostWithNgFixit);
    await hostFixture.whenStable();
  });

  it('highlights the host element under the pointer when Annotation Mode is on', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    movePointerOver(hostButton(hostFixture));
    await hostFixture.whenStable();

    expect(targetHighlight()).not.toBeNull();
  });

  it('does not show a Target highlight when Annotation Mode is off', async () => {
    movePointerOver(hostButton(hostFixture));
    await hostFixture.whenStable();

    expect(targetHighlight()).toBeNull();
  });

  it('updates the Target highlight when the pointer moves across nested elements', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    const panel = hostElement(hostFixture, '[data-testid="host-panel"]');
    const nested = hostElement(hostFixture, '[data-testid="host-nested"]');
    mockElementRect(panel, { x: 0, y: 0, width: 200, height: 100 });
    mockElementRect(nested, { x: 20, y: 20, width: 80, height: 30 });

    movePointerOver(panel);
    await hostFixture.whenStable();

    expect(highlightBox()).toEqual({
      top: '0px',
      left: '0px',
      width: '200px',
      height: '100px',
    });

    movePointerOver(nested);
    await hostFixture.whenStable();

    expect(highlightBox()).toEqual({
      top: '20px',
      left: '20px',
      width: '80px',
      height: '30px',
    });
  });

  it('does not highlight library chrome as a Target', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    movePointerOver(hostButton(hostFixture));
    await hostFixture.whenStable();

    expect(targetHighlight()).not.toBeNull();

    movePointerOver(annotationModeToggle(hostFixture));
    await hostFixture.whenStable();

    expect(targetHighlight()).toBeNull();
  });

  it('clears the Target highlight when Annotation Mode turns off', async () => {
    const toggle = annotationModeToggle(hostFixture);
    toggle.click();
    await hostFixture.whenStable();

    movePointerOver(hostButton(hostFixture));
    await hostFixture.whenStable();

    expect(targetHighlight()).not.toBeNull();

    toggle.click();
    await hostFixture.whenStable();

    expect(targetHighlight()).toBeNull();
  });
});

describe('NgFixit when disabled', () => {
  it('does not show Annotation Mode chrome', async () => {
    await TestBed.configureTestingModule({
      imports: [NgFixit],
      providers: [{ provide: NG_FIXIT_ENABLED, useValue: false }],
    }).compileComponents();

    const fixture = TestBed.createComponent(NgFixit);
    await fixture.whenStable();

    const toggle = fixture.nativeElement.querySelector(
      '[data-testid="fixit-annotation-mode-toggle"]',
    );

    expect(toggle).toBeNull();
  });
});

describe('NgFixit create Annotation', () => {
  let hostFixture: ComponentFixture<HostWithNgFixit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostWithNgFixit],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostWithNgFixit);
    await hostFixture.whenStable();
  });

  it('opens note entry when a Target is clicked in Annotation Mode', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();

    expect(noteEntry()).not.toBeNull();
  });

  it('adds a committed Annotation to the working list with a note preview', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();

    setNoteEntryValue('Fix the button label');
    commitNoteEntry().click();
    await hostFixture.whenStable();

    expect(annotationListNotes()).toEqual(['Fix the button label']);
    expect(noteEntry()).toBeNull();
  });

  it('creates no Annotation when note entry is canceled', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();

    setNoteEntryValue('Will abandon this');
    cancelNoteEntry().click();
    await hostFixture.whenStable();

    expect(annotationListItems()).toEqual([]);
    expect(noteEntry()).toBeNull();
  });

  it('rejects an empty note without creating an Annotation', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();

    setNoteEntryValue('   ');
    commitNoteEntry().click();
    await hostFixture.whenStable();

    expect(annotationListItems()).toEqual([]);
    expect(noteEntry()).not.toBeNull();
  });

  it('shows multiple committed Annotations in the working list', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();
    setNoteEntryValue('First note');
    commitNoteEntry().click();
    await hostFixture.whenStable();

    clickTarget(hostElement(hostFixture, '[data-testid="host-nested"]'));
    await hostFixture.whenStable();
    setNoteEntryValue('Second note');
    commitNoteEntry().click();
    await hostFixture.whenStable();

    expect(annotationListNotes()).toEqual(['First note', 'Second note']);
  });

  it('keeps Annotations in memory only', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();
    setNoteEntryValue('In-memory only');
    commitNoteEntry().click();
    await hostFixture.whenStable();

    expect(setItem).not.toHaveBeenCalled();

    setItem.mockRestore();
  });

  it('cancels note entry when Escape is pressed', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();
    setNoteEntryValue('Will abandon via Escape');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await hostFixture.whenStable();

    expect(annotationListItems()).toEqual([]);
    expect(noteEntry()).toBeNull();
  });

  it('does not start a second create while note entry is open', async () => {
    annotationModeToggle(hostFixture).click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();
    setNoteEntryValue('First draft');

    clickTarget(hostElement(hostFixture, '[data-testid="host-nested"]'));
    await hostFixture.whenStable();

    expect(noteEntryInput().value).toBe('First draft');
    expect(annotationListItems()).toEqual([]);
  });

  it('clears an open draft when Annotation Mode turns off', async () => {
    const toggle = annotationModeToggle(hostFixture);
    toggle.click();
    await hostFixture.whenStable();

    clickTarget(hostButton(hostFixture));
    await hostFixture.whenStable();
    setNoteEntryValue('In flight');

    toggle.click();
    await hostFixture.whenStable();

    expect(noteEntry()).toBeNull();
    expect(annotationListItems()).toEqual([]);
  });
});

describe('NgFixit copy Report', () => {
  let hostFixture: ComponentFixture<HostWithNgFixit>;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await TestBed.configureTestingModule({
      imports: [HostWithNgFixit],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostWithNgFixit);
    await hostFixture.whenStable();
  });

  it('shows a Copy Report control when the library is enabled', () => {
    expect(copyReportButton(hostFixture)).toBeTruthy();
  });

  it('copies Report Markdown for the current Annotations to the clipboard', async () => {
    await createAnnotation(hostFixture, hostButton(hostFixture), 'Fix the button label');

    copyReportButton(hostFixture).click();
    await hostFixture.whenStable();

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Fix the button label'));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('# ng-fixit Report'));
  });

  it('leaves the working Annotation list intact after a successful copy', async () => {
    await createAnnotation(hostFixture, hostButton(hostFixture), 'Keep me after copy');

    copyReportButton(hostFixture).click();
    await hostFixture.whenStable();

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Keep me after copy'));
    expect(annotationListNotes()).toEqual(['Keep me after copy']);
  });

  it('copies a multi-Annotation Report without clearing the list', async () => {
    await createAnnotation(hostFixture, hostButton(hostFixture), 'First note');
    await createAnnotation(
      hostFixture,
      hostElement(hostFixture, '[data-testid="host-nested"]'),
      'Second note',
    );

    copyReportButton(hostFixture).click();
    await hostFixture.whenStable();

    expect(writeText).toHaveBeenCalledTimes(1);
    const markdown = writeText.mock.calls[0]?.[0] as string;
    expect(markdown).toContain('First note');
    expect(markdown).toContain('Second note');
    expect(annotationListNotes()).toEqual(['First note', 'Second note']);
  });

  it('copies a Report that includes captured Target context', async () => {
    const button = hostButton(hostFixture);
    button.id = 'save-action';

    await createAnnotation(hostFixture, button, 'Fix the save action');

    copyReportButton(hostFixture).click();
    await hostFixture.whenStable();

    const markdown = writeText.mock.calls[0]?.[0] as string;
    expect(markdown).toContain('Fix the save action');
    expect(markdown).toContain('#save-action');
  });
});

describe('NgFixit Locator capture', () => {
  let hostFixture: ComponentFixture<HostWithNgFixit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostWithNgFixit],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostWithNgFixit);
    await hostFixture.whenStable();
  });

  it('stores a CSS path Locator summary in the Annotation list after create', async () => {
    const button = hostButton(hostFixture);
    button.id = 'primary-cta';

    await createAnnotation(hostFixture, button, 'Adjust CTA contrast');

    expect(annotationListNotes()).toEqual(['Adjust CTA contrast']);
    expect(annotationListLocators()).toEqual(['#primary-cta']);
  });
});

const annotationModeToggle = (fixture: ComponentFixture<unknown>): HTMLButtonElement => {
  return fixture.nativeElement.querySelector(
    '[data-testid="fixit-annotation-mode-toggle"]',
  ) as HTMLButtonElement;
};

const hostButton = (fixture: ComponentFixture<HostWithNgFixit>): HTMLButtonElement => {
  return hostElement(fixture, '[data-testid="host-button"]') as HTMLButtonElement;
};

const hostElement = (fixture: ComponentFixture<HostWithNgFixit>, selector: string): HTMLElement => {
  return fixture.nativeElement.querySelector(selector) as HTMLElement;
};

const movePointerOver = (element: Element): void => {
  element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
};

const targetHighlight = (): HTMLElement | null => {
  return document.querySelector('[data-testid="fixit-target-highlight"]');
};

const highlightBox = (): {
  top: string;
  left: string;
  width: string;
  height: string;
} => {
  const highlight = targetHighlight();
  if (!highlight) {
    throw new Error('Expected Target highlight to be present');
  }

  return {
    top: highlight.style.top,
    left: highlight.style.left,
    width: highlight.style.width,
    height: highlight.style.height,
  };
};

const mockElementRect = (
  element: HTMLElement,
  box: { x: number; y: number; width: number; height: number },
): void => {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    top: box.y,
    left: box.x,
    right: box.x + box.width,
    bottom: box.y + box.height,
    toJSON: () => ({}),
  });
};

const clickTarget = (element: Element): void => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

const noteEntry = (): HTMLElement | null => {
  return document.querySelector('[data-testid="fixit-note-entry"]');
};

const noteEntryInput = (): HTMLTextAreaElement => {
  return document.querySelector('[data-testid="fixit-note-entry-input"]') as HTMLTextAreaElement;
};

const setNoteEntryValue = (note: string): void => {
  const input = noteEntryInput();
  input.value = note;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

const commitNoteEntry = (): HTMLButtonElement => {
  return document.querySelector('[data-testid="fixit-note-entry-commit"]') as HTMLButtonElement;
};

const cancelNoteEntry = (): HTMLButtonElement => {
  return document.querySelector('[data-testid="fixit-note-entry-cancel"]') as HTMLButtonElement;
};

const annotationListItems = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll('[data-testid="fixit-annotation-list-item"]'));
};

const annotationListNotes = (): string[] => {
  return Array.from(document.querySelectorAll('[data-testid="fixit-annotation-list-note"]')).map(
    item => item.textContent?.trim() ?? '',
  );
};

const annotationListLocators = (): string[] => {
  return Array.from(document.querySelectorAll('[data-testid="fixit-annotation-list-locator"]')).map(
    item => item.textContent?.trim() ?? '',
  );
};

const copyReportButton = (fixture: ComponentFixture<unknown>): HTMLButtonElement => {
  return fixture.nativeElement.querySelector(
    '[data-testid="fixit-copy-report"]',
  ) as HTMLButtonElement;
};

const createAnnotation = async (
  fixture: ComponentFixture<HostWithNgFixit>,
  target: Element,
  note: string,
): Promise<void> => {
  const toggle = annotationModeToggle(fixture);
  if (toggle.getAttribute('aria-pressed') !== 'true') {
    toggle.click();
    await fixture.whenStable();
  }

  clickTarget(target);
  await fixture.whenStable();

  setNoteEntryValue(note);
  commitNoteEntry().click();
  await fixture.whenStable();
};
