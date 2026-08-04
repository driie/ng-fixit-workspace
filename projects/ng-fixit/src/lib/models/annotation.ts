import { HostComponentInfo } from './host-component';
import { Locator } from './locator';

export interface AnnotationTargetContext {
  locator: Locator;
  hostComponent?: HostComponentInfo;
}

export interface Annotation extends AnnotationTargetContext {
  id: string;
  note: string;
}

export interface AnnotationDraft extends AnnotationTargetContext {
  note: string;
}
