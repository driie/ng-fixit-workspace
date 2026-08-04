import { Locator } from './locator';

export interface Annotation {
  id: string;
  note: string;
  locator: Locator;
}

export interface AnnotationDraft {
  locator: Locator;
  note: string;
}
