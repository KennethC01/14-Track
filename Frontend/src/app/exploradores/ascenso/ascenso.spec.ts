import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ascenso } from './ascenso';

describe('Ascenso', () => {
  let component: Ascenso;
  let fixture: ComponentFixture<Ascenso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ascenso],
    }).compileComponents();

    fixture = TestBed.createComponent(Ascenso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
