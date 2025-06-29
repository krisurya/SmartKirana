import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { GlobalToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-speech-editor-cell',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ToastModule],
  templateUrl: './speech-editor-cell.component.html',
  styleUrls: ['./speech-editor-cell.component.scss'],
})
export class SpeechEditorCellComponent {
  @Input() model: string = '';
  @Input() language: string = 'hi-IN';
  
  @Input() row: any;
  @Input() table?: Table;
  
  @Output() modelChange = new EventEmitter<string>();
  @Output() started = new EventEmitter<any>();
  @Output() completed = new EventEmitter<any>();

  isListening = false;

  constructor(private toastService: GlobalToastService) {}

  startRecognition(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      this.toastService.warn('Unsupported', 'Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = this.language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Required for manual silence control

    this.started.emit(this.model);
    this.isListening = true;

    let silenceTimer: any;
    let lastTranscript = '';

    // Reset 2s silence timer
    const resetSilenceTimer = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        finishRecognition(lastTranscript);
      }, 300);
    };

    const finishRecognition = (finalText: string) => {
      recognition.abort(); // stop listening
      this.model = finalText.trim();
      this.modelChange.emit(this.model);
      this.completed.emit();
      this.isListening = false;

      if (this.table && this.row) {
        this.table.initRowEdit(this.row);
      }
    };

    recognition.onresult = (event: any) => {
      let combinedTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        combinedTranscript += result[0].transcript;
      }

      lastTranscript = combinedTranscript;
      this.model = combinedTranscript.trim();

      resetSilenceTimer(); // Every time we get new result, reset the silence wait
    };

    recognition.onerror = (event: any) => {
      clearTimeout(silenceTimer);
      this.toastService.warn('Speech Error', event.error);
      this.isListening = false;
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      this.isListening = false;
    };

    recognition.start();
  }

  onManualChange(value: string) {
    this.modelChange.emit(value);
  }
}
