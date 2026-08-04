import { vi } from 'vitest';

import { captureLocator } from './locator';

describe('captureLocator', () => {
  it('captures a CSS selector path and bounding box for the Target', () => {
    const main = document.createElement('main');
    const button = document.createElement('button');
    button.id = 'save';
    main.append(button);
    document.body.append(main);

    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      x: 40,
      y: 12,
      width: 120,
      height: 36,
      top: 12,
      left: 40,
      right: 160,
      bottom: 48,
      toJSON: () => ({}),
    });

    const locator = captureLocator(button);

    expect(locator.cssPath).toContain('#save');
    expect(locator.boundingBox).toEqual({
      top: 12,
      left: 40,
      width: 120,
      height: 36,
    });

    main.remove();
  });

  it('builds a structural CSS path when the Target has no id', () => {
    const main = document.createElement('main');
    const first = document.createElement('button');
    const second = document.createElement('button');
    main.append(first, second);
    document.body.append(main);

    const locator = captureLocator(second);

    expect(locator.cssPath).toContain('button:nth-of-type(2)');
    expect(locator.cssPath).toContain('main');

    main.remove();
  });

  it('captures nearby visible text when available', () => {
    const button = document.createElement('button');
    button.textContent = '  Save changes  ';
    document.body.append(button);

    const locator = captureLocator(button);

    expect(locator.nearbyText).toBe('Save changes');

    button.remove();
  });

  it('truncates long nearby text', () => {
    const button = document.createElement('button');
    button.textContent = 'x'.repeat(150);
    document.body.append(button);

    const locator = captureLocator(button);

    expect(locator.nearbyText).toBe(`${'x'.repeat(120)}…`);

    button.remove();
  });

  it('captures page URL from the Target document', () => {
    const button = document.createElement('button');
    document.body.append(button);

    const locator = captureLocator(button);

    expect(locator.pageUrl).toBe(button.ownerDocument.defaultView?.location.href);

    button.remove();
  });

  it('omits nearby text when the Target has no text', () => {
    const empty = document.createElement('div');
    document.body.append(empty);

    const locator = captureLocator(empty);

    expect(locator.nearbyText).toBeUndefined();
    expect(locator.cssPath.length).toBeGreaterThan(0);
    expect(locator.boundingBox).toEqual(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
      }),
    );

    empty.remove();
  });
});
