import { Annotation } from './annotation';
import { Locator } from './locator';

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
      ...formatLocatorLines(annotation.locator),
    ].join('\n');
  });

  return `# ng-fixit Report\n\n${sections.join('\n\n')}\n`;
};

const formatLocatorLines = (locator: Locator): string[] => {
  const lines = [
    `- CSS path: \`${locator.cssPath}\``,
    `- Bounding box: top=${locator.boundingBox.top}, left=${locator.boundingBox.left}, width=${locator.boundingBox.width}, height=${locator.boundingBox.height}`,
  ];

  if (locator.nearbyText) {
    lines.push(`- Nearby text: ${locator.nearbyText}`);
  }

  if (locator.pageUrl) {
    lines.push(`- Page URL: ${locator.pageUrl}`);
  }

  return lines;
};
