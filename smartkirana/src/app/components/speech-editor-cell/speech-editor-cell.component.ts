import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  standalone: true,
  selector: 'app-speech-editor-cell',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
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

  constructor(private toast: MessageService) {}

  startRecognition(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      this.toast.add({ severity: 'error', summary: 'Unsupported', detail: 'Speech recognition not supported.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = this.language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    this.started.emit(this.model); // ➕ tell editor to stay open
    this.isListening = true;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      this.model = transcript;
      this.modelChange.emit(this.model);
      this.completed.emit(); // ➕ ensure editor is updated
      this.isListening = false;
      if (this.table && this.row) {
        this.table.initRowEdit(this.row);
      }
    };

    recognition.onerror = (event: any) => {
      this.toast.add({ severity: 'error', summary: 'Speech Error', detail: event.error });
      this.isListening = false;
    };

    recognition.onend = () => {
      this.isListening = false;
    };

    recognition.start();
  }

  onManualChange(value: string) {
    this.modelChange.emit(value);
  }
}
