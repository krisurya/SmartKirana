import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechEditorCellComponent } from './speech-editor-cell.component';

describe('SpeechEditorCellComponent', () => {
  let component: SpeechEditorCellComponent;
  let fixture: ComponentFixture<SpeechEditorCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechEditorCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechEditorCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
