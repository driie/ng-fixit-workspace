import { Annotation } from './annotation';

export const buildReportMarkdown = (annotations: readonly Annotation[]): string => {
  if (annotations.length === 0) {
    return '# ng-fixit Report\n';
  }

  const sections = annotations.map((annotation, index) => {
    return [
      `## Annotation ${index + 1}`,
      '',
      annotation.note,
      '',
      `- Target: \`${annotation.locatorSummary}\``,
    ].join('\n');
  });

  return `# ng-fixit Report\n\n${sections.join('\n\n')}\n`;
};
