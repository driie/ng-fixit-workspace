import { BoundingBox } from '../models/locator';

export const PointerTargetKind = {
  Target: 'target',
  Blocked: 'blocked',
} as const;

export type PointerTargetKind = (typeof PointerTargetKind)[keyof typeof PointerTargetKind];

export interface PointerTarget {
  element: Element;
  kind: PointerTargetKind;
}

export interface TargetHighlightBox {
  top: string;
  left: string;
  width: string;
  height: string;
}

export const resolvePointerTarget = (eventTarget: EventTarget | null): PointerTarget | null => {
  if (!(eventTarget instanceof Element)) {
    return null;
  }

  if (isLibraryChrome(eventTarget)) {
    return {
      element: eventTarget.closest('[data-fixit-chrome]') ?? eventTarget,
      kind: PointerTargetKind.Blocked,
    };
  }

  return {
    element: eventTarget,
    kind: PointerTargetKind.Target,
  };
};

export const highlightBoxFromBoundingBox = (box: BoundingBox): TargetHighlightBox => {
  return {
    top: `${box.top}px`,
    left: `${box.left}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
};

export const highlightBoxFromElement = (target: Element): TargetHighlightBox => {
  return highlightBoxFromBoundingBox(target.getBoundingClientRect());
};

const isLibraryChrome = (element: Element): boolean => {
  return element.closest('[data-fixit-chrome]') !== null;
};
