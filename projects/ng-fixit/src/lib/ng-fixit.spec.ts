import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFixit } from './ng-fixit';

describe('NgFixit', () => {
  let component: NgFixit;
  let fixture: ComponentFixture<NgFixit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgFixit],
    }).compileComponents();

    fixture = TestBed.createComponent(NgFixit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
