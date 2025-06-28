import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechMicButtonComponent } from './speech-mic-button.component';

describe('SpeechMicButtonComponent', () => {
  let component: SpeechMicButtonComponent;
  let fixture: ComponentFixture<SpeechMicButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechMicButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechMicButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
