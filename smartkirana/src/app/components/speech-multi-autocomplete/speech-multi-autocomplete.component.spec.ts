import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechMultiAutocompleteComponent } from './speech-multi-autocomplete.component';

describe('SpeechMultiAutocompleteComponent', () => {
  let component: SpeechMultiAutocompleteComponent;
  let fixture: ComponentFixture<SpeechMultiAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechMultiAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechMultiAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
