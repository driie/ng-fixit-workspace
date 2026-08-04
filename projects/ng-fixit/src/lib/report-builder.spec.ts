import { Annotation } from './annotation';
import { buildReportMarkdown } from './report-builder';

describe('buildReportMarkdown', () => {
  it('returns a stable empty Report when there are no Annotations', () => {
    expect(buildReportMarkdown([])).toBe('# ng-fixit Report\n');
  });

  it('includes the Annotation note prominently for a single Annotation', () => {
    const annotations: readonly Annotation[] = [
      { id: '1', note: 'Fix the button label', locatorSummary: 'button' },
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain('# ng-fixit Report');
    expect(markdown).toContain('## Annotation 1');
    expect(markdown).toContain('Fix the button label');
  });

  it('renders a stable multi-Annotation structure with every note', () => {
    const annotations: readonly Annotation[] = [
      { id: '1', note: 'First note', locatorSummary: 'button' },
      { id: '2', note: 'Second note', locatorSummary: 'span' },
    ];

    expect(buildReportMarkdown(annotations)).toBe(
      [
        '# ng-fixit Report',
        '',
        '## Annotation 1',
        '',
        'First note',
        '',
        '- Target: `button`',
        '',
        '## Annotation 2',
        '',
        'Second note',
        '',
        '- Target: `span`',
        '',
      ].join('\n'),
    );
  });

  it('includes each Annotation locatorSummary as Target context', () => {
    const annotations: readonly Annotation[] = [
      { id: '1', note: 'Fix contrast', locatorSummary: 'button.primary' },
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain('- Target: `button.primary`');
  });
});
