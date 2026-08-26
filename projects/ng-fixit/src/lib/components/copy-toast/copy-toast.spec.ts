import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AnnotationSessionStore } from '../../services/annotation-session-store';
import { COPY_TOAST_DURATION_MS, CopyToast } from './copy-toast';

describe('CopyToast', () => {
  let fixture: ComponentFixture<CopyToast>;
  let toast: CopyToast;
  let store: AnnotationSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyToast],
      providers: [AnnotationSessionStore],
    }).compileComponents();

    store = TestBed.inject(AnnotationSessionStore);
    fixture = TestBed.createComponent(CopyToast);
    toast = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays hidden until shown', () => {
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(true);
  });

  it('announces that the Report was copied when shown', () => {
    toast.show();
    fixture.detectChanges();

    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(false);
    expect(copyToastMessage(fixture)).toBe('Report copied');
    expect(fixture.nativeElement.getAttribute('role')).toBe('status');
  });

  it('hides when Close is pressed', () => {
    toast.show();
    fixture.detectChanges();

    closeButton(fixture).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(true);
  });

  it('clears all Annotations from the working list', () => {
    store.beginCreate({
      locator: { cssPath: 'button', boundingBox: { top: 0, left: 0, width: 10, height: 10 } },
    });
    store.updateDraftNote('First note');
    store.commitDraft();

    toast.show();
    fixture.detectChanges();

    clearAllButton(fixture).click();
    fixture.detectChanges();

    expect(store.annotations()).toEqual([]);
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(false);
  });

  it('hides after 5 seconds', () => {
    vi.useFakeTimers();

    toast.show();
    fixture.detectChanges();

    vi.advanceTimersByTime(COPY_TOAST_DURATION_MS - 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(false);

    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(true);
  });

  it('stops the auto-close timeout while hovered', () => {
    vi.useFakeTimers();

    toast.show();
    fixture.detectChanges();

    fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(COPY_TOAST_DURATION_MS * 2);
    fixture.detectChanges();

    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(false);
  });

  it('resumes the remaining auto-close timeout after hover ends', () => {
    vi.useFakeTimers();

    toast.show();
    fixture.detectChanges();

    vi.advanceTimersByTime(3000);
    fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(10000);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(false);

    fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1999);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(false);

    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(true);
  });

  it('restarts the auto-close timeout when shown again', () => {
    vi.useFakeTimers();

    toast.show();
    fixture.detectChanges();

    vi.advanceTimersByTime(4000);
    toast.show();
    fixture.detectChanges();

    vi.advanceTimersByTime(COPY_TOAST_DURATION_MS - 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(false);

    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute('hidden')).toBe(true);
  });
});

const copyToastMessage = (fixture: ComponentFixture<CopyToast>): string => {
  return (
    fixture.nativeElement.querySelector('.fixit-copy-toast-message')?.textContent?.trim() ?? ''
  );
};

const clearAllButton = (fixture: ComponentFixture<CopyToast>): HTMLButtonElement => {
  return fixture.nativeElement.querySelector(
    '[data-testid="fixit-copy-toast-clear"]',
  ) as HTMLButtonElement;
};

const closeButton = (fixture: ComponentFixture<CopyToast>): HTMLButtonElement => {
  return fixture.nativeElement.querySelector(
    '[data-testid="fixit-copy-toast-close"]',
  ) as HTMLButtonElement;
};
