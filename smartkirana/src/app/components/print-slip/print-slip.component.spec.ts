import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintSlipComponent } from './print-slip.component';

describe('PrintSlipComponent', () => {
  let component: PrintSlipComponent;
  let fixture: ComponentFixture<PrintSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintSlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
