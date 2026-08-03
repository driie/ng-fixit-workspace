export interface Annotation {
  id: string;
  note: string;
  locatorSummary: string;
}

export interface AnnotationCreateTarget {
  locatorSummary: string;
}

export interface AnnotationDraft {
  locatorSummary: string;
}
