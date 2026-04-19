import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponsComponent } from './coupons-component';

describe('CouponsComponent', () => {
  let component: CouponsComponent;
  let fixture: ComponentFixture<CouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CouponsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
