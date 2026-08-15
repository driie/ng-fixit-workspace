import { ComponentFixture, TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    fixture = await renderApp();
  });

  it('shows the Annotation Mode toggle', () => {
    const toggle = fixture.nativeElement.querySelector(
      '[data-testid="fixit-annotation-mode-toggle"]',
    );

    expect(toggle).not.toBeNull();
  });

  it('shows sample Targets outside library chrome', () => {
    const payInvoice = samplePayInvoice(fixture);

    expect(payInvoice).not.toBeNull();
    expect(payInvoice?.closest('[data-fixit-chrome]')).toBeNull();
    expect(payInvoice?.closest('ng-fixit')).toBeNull();
  });

  it('includes the nested sample Host Component in the copied Report', async () => {
    const writeText = mockClipboard();

    annotationModeToggle(fixture).click();
    await fixture.whenStable();

    const payInvoice = samplePayInvoice(fixture);
    expect(payInvoice).not.toBeNull();
    clickTarget(payInvoice as HTMLButtonElement);
    await fixture.whenStable();

    setNoteEntryValue('Fix the pay action contrast');
    commitNoteEntry().click();
    await fixture.whenStable();

    copyReportButton(fixture).click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledTimes(1);
    const markdown = writeText.mock.calls[0]?.[0] as string;
    expect(markdown).toContain('DemoInvoiceCard');
  });
});

const renderApp = async () => {
  await TestBed.configureTestingModule({
    imports: [App],
  }).compileComponents();

  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture;
};

const samplePayInvoice = (fixture: ComponentFixture<App>): HTMLButtonElement | null => {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  ) as HTMLButtonElement[];
  return buttons.find(button => button.textContent?.trim() === 'Pay invoice') ?? null;
};

const annotationModeToggle = (host: ComponentFixture<App>): HTMLButtonElement => {
  return host.nativeElement.querySelector(
    '[data-testid="fixit-annotation-mode-toggle"]',
  ) as HTMLButtonElement;
};

const copyReportButton = (host: ComponentFixture<App>): HTMLButtonElement => {
  return host.nativeElement.querySelector('[data-testid="fixit-copy-report"]') as HTMLButtonElement;
};

const clickTarget = (element: Element): void => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

const setNoteEntryValue = (note: string): void => {
  const input = document.querySelector(
    '[data-testid="fixit-note-entry-input"]',
  ) as HTMLTextAreaElement;
  input.value = note;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

const commitNoteEntry = (): HTMLButtonElement => {
  return document.querySelector('[data-testid="fixit-note-entry-commit"]') as HTMLButtonElement;
};

const mockClipboard = (): ReturnType<typeof vi.fn> => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return writeText;
};
