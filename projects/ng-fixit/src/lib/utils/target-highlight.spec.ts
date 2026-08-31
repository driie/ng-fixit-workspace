import { vi } from 'vitest';

import {
  highlightBoxFromElement,
  PointerTargetKind,
  resolvePointerTarget,
} from './target-highlight';

describe('resolvePointerTarget', () => {
  it('returns a Target for the element under the pointer when it is not library chrome', () => {
    const target = document.createElement('button');
    document.body.append(target);

    expect(resolvePointerTarget(target)).toEqual({
      element: target,
      kind: PointerTargetKind.Target,
    });

    target.remove();
  });

  it('ignores library chrome and descendants', () => {
    const chrome = document.createElement('div');
    chrome.setAttribute('data-fixit-chrome', '');
    const nested = document.createElement('button');
    chrome.append(nested);
    document.body.append(chrome);

    expect(resolvePointerTarget(chrome)).toBeNull();
    expect(resolvePointerTarget(nested)).toBeNull();

    chrome.remove();
  });

  it('returns null for non-element targets', () => {
    expect(resolvePointerTarget(null)).toBeNull();
    expect(resolvePointerTarget(document)).toBeNull();
  });
});

describe('highlightBoxFromElement', () => {
  it('maps the element bounding box to fixed overlay style values', () => {
    const target = document.createElement('div');
    document.body.append(target);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 10,
      y: 20,
      width: 100,
      height: 40,
      top: 20,
      left: 10,
      right: 110,
      bottom: 60,
      toJSON: () => ({}),
    });

    expect(highlightBoxFromElement(target)).toEqual({
      top: '20px',
      left: '10px',
      width: '100px',
      height: '40px',
    });

    target.remove();
  });
});
