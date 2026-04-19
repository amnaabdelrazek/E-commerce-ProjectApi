import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellersMangement } from './sellers-mangement';

describe('SellersMangement', () => {
  let component: SellersMangement;
  let fixture: ComponentFixture<SellersMangement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellersMangement],
    }).compileComponents();

    fixture = TestBed.createComponent(SellersMangement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
