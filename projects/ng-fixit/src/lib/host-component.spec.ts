import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { discoverHostComponent } from './host-component';

@Component({
  selector: 'fixit-known-host',
  template: `
    <button type="button" data-testid="known-host-button">Action</button>
    <span data-testid="known-host-nested">Nested</span>
  `,
})
class KnownHost {
  label = 'known';
}

@Component({
  selector: 'fixit-inner-host',
  template: `<button type="button" data-testid="inner-host-button">Inner</button>`,
})
class InnerHost {}

@Component({
  selector: 'fixit-outer-host',
  imports: [InnerHost],
  template: `<fixit-inner-host />`,
})
class OuterHost {}

describe('discoverHostComponent', () => {
  let fixture: ComponentFixture<KnownHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnownHost],
    }).compileComponents();

    fixture = TestBed.createComponent(KnownHost);
    await fixture.whenStable();
  });

  it('returns Host Component metadata for a Target inside a known host', () => {
    const target = fixture.nativeElement.querySelector(
      '[data-testid="known-host-button"]',
    ) as HTMLElement;

    const host = discoverHostComponent(target);

    expect(host).toEqual(
      expect.objectContaining({
        name: 'KnownHost',
        selector: 'fixit-known-host',
      }),
    );
  });

  it('returns Host Component metadata when the Target is a nested element', () => {
    const target = fixture.nativeElement.querySelector(
      '[data-testid="known-host-nested"]',
    ) as HTMLElement;

    const host = discoverHostComponent(target);

    expect(host?.name).toBe('KnownHost');
    expect(host?.selector).toBe('fixit-known-host');
  });

  it('returns the nearest Host Component when Targets sit inside nested hosts', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [OuterHost],
    }).compileComponents();

    const outerFixture = TestBed.createComponent(OuterHost);
    await outerFixture.whenStable();

    const target = outerFixture.nativeElement.querySelector(
      '[data-testid="inner-host-button"]',
    ) as HTMLElement;

    const host = discoverHostComponent(target);

    expect(host).toEqual(
      expect.objectContaining({
        name: 'InnerHost',
        selector: 'fixit-inner-host',
      }),
    );
    expect(host?.name).not.toBe('OuterHost');
  });

  it('returns undefined without throwing for a pure DOM Target', () => {
    const orphan = document.createElement('button');
    document.body.append(orphan);

    expect(() => discoverHostComponent(orphan)).not.toThrow();
    expect(discoverHostComponent(orphan)).toBeUndefined();

    orphan.remove();
  });
});
