import { BoundingBox } from '../models/locator';

export interface TargetHighlightBox {
  top: string;
  left: string;
  width: string;
  height: string;
}

export const resolvePointerTarget = (eventTarget: EventTarget | null): Element | null => {
  if (!(eventTarget instanceof Element) || isLibraryChrome(eventTarget)) {
    return null;
  }

  return eventTarget;
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
