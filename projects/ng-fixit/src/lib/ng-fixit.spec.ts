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
