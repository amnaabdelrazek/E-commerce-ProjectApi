import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelComponent } from './cancel.component';

describe('CancelComponent', () => {
  let component: CancelComponent;
  let fixture: ComponentFixture<CancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
