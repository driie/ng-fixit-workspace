import { vi } from 'vitest';

import { NoteEntryPlacement, PointerTargetKind } from '../models/target-overlay';
import {
  highlightBoxFromElement,
  noteEntryPositionFromElement,
  resolvePointerTarget,
  targetLabelFromElement,
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

describe('noteEntryPositionFromElement', () => {
  it('positions note entry below the Target when the viewport has room', () => {
    const target = document.createElement('button');
    document.body.append(target);
    mockElementRect(target, { x: 24, y: 40, width: 100, height: 40 });

    expect(noteEntryPositionFromElement(target, 1024, 768)).toEqual({
      top: '88px',
      left: '24px',
      placement: NoteEntryPlacement.Below,
    });

    target.remove();
  });

  it('positions note entry above the Target near the viewport bottom', () => {
    const target = document.createElement('button');
    document.body.append(target);
    mockElementRect(target, { x: 24, y: 720, width: 100, height: 40 });

    expect(noteEntryPositionFromElement(target, 1024, 768)).toEqual({
      top: '712px',
      left: '24px',
      placement: NoteEntryPlacement.Above,
    });

    target.remove();
  });

  it('keeps note entry within the viewport width', () => {
    const target = document.createElement('button');
    document.body.append(target);
    mockElementRect(target, { x: 940, y: 40, width: 80, height: 40 });

    expect(noteEntryPositionFromElement(target, 1024, 768).left).toBe('656px');

    target.remove();
  });
});

describe('targetLabelFromElement', () => {
  it('uses the native element type as the Target label', () => {
    expect(targetLabelFromElement(document.createElement('div'))).toBe('div');
  });

  it('uses a custom element name as the Target label', () => {
    expect(targetLabelFromElement(document.createElement('my-component'))).toBe('my-component');
  });
});

const mockElementRect = (
  element: Element,
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
