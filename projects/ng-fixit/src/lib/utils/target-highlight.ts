import { BoundingBox } from '../models/locator';
import {
  NoteEntryPlacement,
  NoteEntryPosition,
  PointerTarget,
  PointerTargetKind,
  TargetHighlightBox,
} from '../models/target-overlay';

const NOTE_ENTRY_GAP_PX = 8;
const NOTE_ENTRY_MARGIN_PX = 16;
const NOTE_ENTRY_MIN_ROOM_PX = 96;
const NOTE_ENTRY_WIDTH_PX = 352;

export const resolvePointerTarget = (eventTarget: EventTarget | null): PointerTarget | null => {
  if (!(eventTarget instanceof Element)) {
    return null;
  }

  if (isLibraryChrome(eventTarget)) {
    return null;
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

export const noteEntryPositionFromElement = (
  target: Element,
  viewportWidth: number,
  viewportHeight: number,
): NoteEntryPosition => {
  const box = target.getBoundingClientRect();
  const noteEntryWidth = Math.min(
    NOTE_ENTRY_WIDTH_PX,
    Math.max(viewportWidth - NOTE_ENTRY_MARGIN_PX * 2, 0),
  );
  const maximumLeft = Math.max(
    NOTE_ENTRY_MARGIN_PX,
    viewportWidth - noteEntryWidth - NOTE_ENTRY_MARGIN_PX,
  );
  const left = Math.min(Math.max(box.left, NOTE_ENTRY_MARGIN_PX), maximumLeft);
  const roomAbove = box.top;
  const roomBelow = viewportHeight - box.bottom;
  const placement =
    roomBelow >= NOTE_ENTRY_MIN_ROOM_PX || roomBelow >= roomAbove
      ? NoteEntryPlacement.Below
      : NoteEntryPlacement.Above;
  const top =
    placement === NoteEntryPlacement.Below
      ? box.bottom + NOTE_ENTRY_GAP_PX
      : box.top - NOTE_ENTRY_GAP_PX;

  return {
    top: `${top}px`,
    left: `${left}px`,
    placement,
  };
};

export const targetLabelFromElement = (target: Element): string => {
  return target.localName;
};

const isLibraryChrome = (element: Element): boolean => {
  return element.closest('[data-fixit-chrome]') !== null;
};
