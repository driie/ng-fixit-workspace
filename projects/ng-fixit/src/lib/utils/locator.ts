import { Locator } from '../models/locator';

const NEARBY_TEXT_MAX_LENGTH = 120;

export const captureLocator = (element: Element): Locator => {
  const rect = element.getBoundingClientRect();
  const nearbyText = captureNearbyText(element);
  const pageUrl = element.ownerDocument.defaultView?.location?.href;

  return {
    cssPath: buildCssPath(element),
    boundingBox: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    ...(nearbyText ? { nearbyText } : {}),
    ...(pageUrl ? { pageUrl } : {}),
  };
};

const captureNearbyText = (element: Element): string | undefined => {
  const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  if (text.length === 0) {
    return undefined;
  }

  return text.length > NEARBY_TEXT_MAX_LENGTH ? `${text.slice(0, NEARBY_TEXT_MAX_LENGTH)}…` : text;
};

const buildCssPath = (element: Element): string => {
  if (element.id) {
    return `#${cssEscapeIdent(element.id)}`;
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current) {
    const tagName = current.tagName.toLowerCase();

    if (current.id) {
      segments.unshift(`#${cssEscapeIdent(current.id)}`);
      break;
    }

    const parent: Element | null = current.parentElement;
    if (!parent) {
      segments.unshift(tagName);
      break;
    }

    const tag = current.tagName;
    const siblings = Array.from(parent.children).filter(sibling => sibling.tagName === tag);
    const index = siblings.indexOf(current) + 1;
    const segment = siblings.length > 1 ? `${tagName}:nth-of-type(${index})` : tagName;
    segments.unshift(segment);
    current = parent;

    if (tagName === 'html') {
      break;
    }
  }

  return segments.join(' > ');
};

const cssEscapeIdent = (value: string): string => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
};
