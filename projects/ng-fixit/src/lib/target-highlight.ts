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

export const highlightBoxFromElement = (target: Element): TargetHighlightBox => {
  const rect = target.getBoundingClientRect();

  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  };
};

const isLibraryChrome = (element: Element): boolean => {
  return element.closest('[data-fixit-chrome]') !== null;
};
