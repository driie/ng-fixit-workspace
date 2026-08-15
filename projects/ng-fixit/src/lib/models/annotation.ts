import { HostComponentInfo } from './host-component';
import { Locator } from './locator';

export const DraftKind = {
  Create: 'create',
  Edit: 'edit',
} as const;

export type DraftKind = (typeof DraftKind)[keyof typeof DraftKind];

export interface AnnotationTargetContext {
  locator: Locator;
  hostComponent?: HostComponentInfo;
}

export interface Annotation extends AnnotationTargetContext {
  id: string;
  note: string;
}

export interface CreateDraft extends AnnotationTargetContext {
  kind: typeof DraftKind.Create;
  note: string;
}

export interface EditDraft {
  kind: typeof DraftKind.Edit;
  id: string;
  note: string;
}

export type AnnotationDraft = CreateDraft | EditDraft;
