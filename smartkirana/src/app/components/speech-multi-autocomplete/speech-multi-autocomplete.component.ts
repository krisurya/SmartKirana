import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-speech-multi-autocomplete',
  standalone: true,
  templateUrl: './speech-multi-autocomplete.component.html',
  styleUrls: ['./speech-multi-autocomplete.component.scss'],
  imports: [CommonModule, FormsModule, AutoCompleteModule, ButtonModule],
})
export class SpeechMultiAutocompleteComponent {
  @Input() model: string[] = [];
  @Output() modelChange = new EventEmitter<string[]>();

  @Input() suggestions: string[] = [];
  @Input() placeholder: string = 'Select or add aliases';
  @Input() language: string = 'hi-IN';

  filtered: string[] = [];

  @ViewChild(AutoComplete) autoComplete!: AutoComplete;

  lastTyped: string = '';

  filter(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    this.lastTyped = query;
    this.filtered = this.suggestions.filter(s =>
      s.toLowerCase().includes(query)
    );
  }

  addIfNotPresent(event: AutoCompleteSelectEvent): void {
    const selected = event.value.trim();
    if (!this.model.includes(selected)) {
      this.model = [...this.model, selected];
      this.modelChange.emit(this.model);
    }
  }

  addTypedValue(): void {
    const input = this.autoComplete?.inputEL?.nativeElement?.value?.trim();
    if (!input) return;

    const exists = this.model.some(alias => alias.toLowerCase() === input.toLowerCase());
    if (!exists) {
      this.model = [...this.model, input];
      this.modelChange.emit(this.model);
    }

    // Clear input
    if (this.autoComplete?.inputEL?.nativeElement) {
      this.autoComplete.inputEL.nativeElement.value = '';
    }
  }

  startSpeech(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = this.language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      const exists = this.model.some(alias => alias.toLowerCase() === transcript.toLowerCase());

      if (transcript && !exists) {
        this.model = [...this.model, transcript];
        this.modelChange.emit(this.model);
      }
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  }
}
