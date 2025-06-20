import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartKiranaLayoutComponent } from './smart-kirana-layout.component';

describe('SmartKiranaLayoutComponent', () => {
  let component: SmartKiranaLayoutComponent;
  let fixture: ComponentFixture<SmartKiranaLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartKiranaLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartKiranaLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
