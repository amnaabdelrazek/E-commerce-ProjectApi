import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutCpmponent } from './checkout-cpmponent';

describe('CheckoutCpmponent', () => {
  let component: CheckoutCpmponent;
  let fixture: ComponentFixture<CheckoutCpmponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutCpmponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutCpmponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
