export const NoteEntryPlacement = {
  Above: 'above',
  Below: 'below',
} as const;

export type NoteEntryPlacement = (typeof NoteEntryPlacement)[keyof typeof NoteEntryPlacement];

export const PointerTargetKind = {
  Target: 'target',
} as const;

export type PointerTargetKind = (typeof PointerTargetKind)[keyof typeof PointerTargetKind];

export interface NoteEntryPosition {
  top: string;
  left: string;
  placement: NoteEntryPlacement;
}

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
