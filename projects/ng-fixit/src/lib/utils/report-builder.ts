import { Annotation } from '../models/annotation';
import { Locator } from '../models/locator';

const REPORT_INTRODUCTION =
  'The following findings describe requested UI changes. Review each Annotation, use its Target details to locate the relevant interface and code, and implement the requested changes.';

export const buildReportMarkdown = (annotations: readonly Annotation[]): string => {
  const sections = annotations.map((annotation, index) => {
    return [
      `## Annotation ${index + 1}`,
      '',
      annotation.note,
      '',
      ...formatLocatorLines(annotation.locator),
      ...formatHostComponentLines(annotation.hostComponent),
    ].join('\n');
  });

  return `${[REPORT_INTRODUCTION, ...sections].join('\n\n')}\n`;
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

const formatHostComponentLines = (hostComponent: Annotation['hostComponent']): string[] => {
  if (!hostComponent) {
    return [];
  }

  if (hostComponent.selector) {
    return [`- Host Component: \`${hostComponent.selector}\` (${hostComponent.name})`];
  }

  return [`- Host Component: ${hostComponent.name}`];
};
