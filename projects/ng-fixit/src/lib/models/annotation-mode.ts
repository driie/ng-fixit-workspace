export const AnnotationMode = {
  Off: 'off',
  On: 'on',
} as const;

export type AnnotationMode = (typeof AnnotationMode)[keyof typeof AnnotationMode];

export const ANNOTATION_MODES = Object.values(AnnotationMode) as AnnotationMode[];
