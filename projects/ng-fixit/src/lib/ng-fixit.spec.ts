import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NG_FIXIT_ENABLED, NgFixit } from './ng-fixit';

@Component({
  imports: [NgFixit],
  template: `
    <button type="button" data-host-button (click)="hostClicks = hostClicks + 1">Host</button>
    <ng-fixit />
  `,
})
class HostWithNgFixit {
  hostClicks = 0;
}

describe('NgFixit', () => {
  let fixture: ComponentFixture<NgFixit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgFixit, HostWithNgFixit],
    }).compileComponents();

    fixture = TestBed.createComponent(NgFixit);
    await fixture.whenStable();
  });

  it('shows Annotation Mode toggle chrome when mounted', () => {
    const toggle = fixture.nativeElement.querySelector('[data-fixit-annotation-mode-toggle]');

    expect(toggle).not.toBeNull();
  });

  it('starts with Annotation Mode off', () => {
    const toggle = annotationModeToggle();

    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.getAttribute('data-fixit-annotation-mode')).toBe('off');
  });

  it('turns Annotation Mode on when the toggle is activated', async () => {
    annotationModeToggle().click();
    await fixture.whenStable();

    expect(annotationModeToggle().getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.getAttribute('data-fixit-annotation-mode')).toBe('on');
  });

  it('turns Annotation Mode off when the toggle is activated again', async () => {
    annotationModeToggle().click();
    await fixture.whenStable();
    annotationModeToggle().click();
    await fixture.whenStable();

    expect(annotationModeToggle().getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.getAttribute('data-fixit-annotation-mode')).toBe('off');
  });

  it('lets host content receive clicks when Annotation Mode is off', async () => {
    const hostFixture = TestBed.createComponent(HostWithNgFixit);
    await hostFixture.whenStable();

    const hostButton = hostFixture.nativeElement.querySelector(
      '[data-host-button]',
    ) as HTMLButtonElement;
    hostButton.click();
    await hostFixture.whenStable();

    expect(hostFixture.componentInstance.hostClicks).toBe(1);
  });

  it('keeps Annotation Mode in memory only', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    annotationModeToggle().click();
    await fixture.whenStable();
    annotationModeToggle().click();
    await fixture.whenStable();

    expect(setItem).not.toHaveBeenCalled();

    setItem.mockRestore();
  });

  const annotationModeToggle = (): HTMLButtonElement => {
    return fixture.nativeElement.querySelector(
      '[data-fixit-annotation-mode-toggle]',
    ) as HTMLButtonElement;
  };
});

describe('NgFixit when disabled', () => {
  it('does not show Annotation Mode chrome', async () => {
    await TestBed.configureTestingModule({
      imports: [NgFixit],
      providers: [{ provide: NG_FIXIT_ENABLED, useValue: false }],
    }).compileComponents();

    const fixture = TestBed.createComponent(NgFixit);
    await fixture.whenStable();

    const toggle = fixture.nativeElement.querySelector('[data-fixit-annotation-mode-toggle]');

    expect(toggle).toBeNull();
  });
});
