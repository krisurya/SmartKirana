import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceOrderComponent } from './voice-order.component';

describe('VoiceOrderComponent', () => {
  let component: VoiceOrderComponent;
  let fixture: ComponentFixture<VoiceOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoiceOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
