import { Annotation } from '../models/annotation';
import { HostComponentInfo } from '../models/host-component';
import { Locator } from '../models/locator';
import { buildReportMarkdown } from './report-builder';

const locatorFixture = (overrides: Partial<Locator> = {}): Locator => {
  return {
    cssPath: 'button',
    boundingBox: { top: 0, left: 0, width: 10, height: 10 },
    ...overrides,
  };
};

const hostComponentFixture = (overrides: Partial<HostComponentInfo> = {}): HostComponentInfo => {
  return {
    name: 'KnownHost',
    selector: 'fixit-known-host',
    ...overrides,
  };
};

const annotationFixture = (
  overrides: Partial<Annotation> & Pick<Annotation, 'id' | 'note'>,
): Annotation => {
  return {
    locator: locatorFixture(),
    ...overrides,
  };
};

describe('buildReportMarkdown', () => {
  it('returns a stable empty Report when there are no Annotations', () => {
    expect(buildReportMarkdown([])).toBe(
      'The following findings describe requested UI changes. Review each Annotation, use its Target details to locate the relevant interface and code, and implement the requested changes.\n',
    );
  });

  it('includes the Annotation note prominently for a single Annotation', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({ id: '1', note: 'Fix the button label' }),
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain(
      'The following findings describe requested UI changes. Review each Annotation, use its Target details to locate the relevant interface and code, and implement the requested changes.',
    );
    expect(markdown).toContain('## Annotation 1');
    expect(markdown).toContain('Fix the button label');
  });

  it('includes CSS path and bounding box for each Annotation', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({
        id: '1',
        note: 'Fix contrast',
        locator: locatorFixture({
          cssPath: 'main > button#save',
          boundingBox: { top: 12, left: 40, width: 120, height: 36 },
        }),
      }),
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain('- CSS path: `main > button#save`');
    expect(markdown).toContain('- Bounding box: top=12, left=40, width=120, height=36');
  });

  it('includes nearby text and page URL when present', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({
        id: '1',
        note: 'Rename label',
        locator: locatorFixture({
          cssPath: 'button',
          nearbyText: 'Save changes',
          pageUrl: 'http://localhost/app',
        }),
      }),
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain('- Nearby text: Save changes');
    expect(markdown).toContain('- Page URL: http://localhost/app');
  });

  it('omits absent optional Locator fields without breaking the Report', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({
        id: '1',
        note: 'Only required Locator fields',
        locator: locatorFixture({
          cssPath: 'div.card',
          boundingBox: { top: 1, left: 2, width: 3, height: 4 },
        }),
      }),
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain('- CSS path: `div.card`');
    expect(markdown).toContain('- Bounding box: top=1, left=2, width=3, height=4');
    expect(markdown).not.toContain('Nearby text');
    expect(markdown).not.toContain('Page URL');
    expect(markdown).toContain('Only required Locator fields');
  });

  it('renders a stable multi-Annotation structure with every note', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({
        id: '1',
        note: 'First note',
        locator: locatorFixture({
          cssPath: 'button',
          boundingBox: { top: 0, left: 0, width: 10, height: 10 },
        }),
      }),
      annotationFixture({
        id: '2',
        note: 'Second note',
        locator: locatorFixture({
          cssPath: 'span',
          boundingBox: { top: 5, left: 5, width: 20, height: 8 },
          nearbyText: 'Label',
        }),
      }),
    ];

    expect(buildReportMarkdown(annotations)).toBe(
      [
        'The following findings describe requested UI changes. Review each Annotation, use its Target details to locate the relevant interface and code, and implement the requested changes.',
        '',
        '## Annotation 1',
        '',
        'First note',
        '',
        '- CSS path: `button`',
        '- Bounding box: top=0, left=0, width=10, height=10',
        '',
        '## Annotation 2',
        '',
        'Second note',
        '',
        '- CSS path: `span`',
        '- Bounding box: top=5, left=5, width=20, height=8',
        '- Nearby text: Label',
        '',
      ].join('\n'),
    );
  });

  it('includes Host Component selector and name when present', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({
        id: '1',
        note: 'Fix the host button',
        hostComponent: hostComponentFixture({
          name: 'KnownHost',
          selector: 'fixit-known-host',
        }),
      }),
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain('- Host Component: `fixit-known-host` (KnownHost)');
  });

  it('includes Host Component name only when selector is absent', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({
        id: '1',
        note: 'Name only host',
        hostComponent: hostComponentFixture({
          name: 'KnownHost',
          selector: undefined,
        }),
      }),
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).toContain('- Host Component: KnownHost');
    expect(markdown).not.toContain('`undefined`');
  });

  it('omits Host Component when absent without breaking the Report', () => {
    const annotations: readonly Annotation[] = [
      annotationFixture({
        id: '1',
        note: 'No host metadata',
      }),
    ];

    const markdown = buildReportMarkdown(annotations);

    expect(markdown).not.toContain('Host Component');
    expect(markdown).toContain('No host metadata');
    expect(markdown).toContain('- CSS path:');
  });
});
