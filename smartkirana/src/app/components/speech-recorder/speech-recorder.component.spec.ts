import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechRecorderComponent } from './speech-recorder.component';

describe('SpeechRecorderComponent', () => {
  let component: SpeechRecorderComponent;
  let fixture: ComponentFixture<SpeechRecorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechRecorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
