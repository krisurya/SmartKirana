import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-speech-mic-button',
  standalone: true,
  templateUrl: './speech-mic-button.component.html',
  styleUrls: ['./speech-mic-button.component.scss'],
  imports: [ButtonModule, ToastModule],
  providers: [MessageService],
})
export class SpeechMicButtonComponent {
  @Input() language = 'hi-IN';
  @Output() transcript = new EventEmitter<string>();
  @Output() started = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

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
    recognition.continuous = true;
    recognition.interimResults = false;
    // recognition.maxAlternatives = 1;

    this.started.emit();
    this.isListening = true;

    let silenceTimer: any;
    let lastTranscript = '';

    const finish = () => {
      recognition.abort();
      this.transcript.emit(lastTranscript.trim());
      this.completed.emit();
      this.isListening = false;
    };

    const resetSilence = () => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => finish(), 300);
    };

    recognition.onresult = (e: any) => {
      let txt = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        txt += e.results[i][0].transcript;
      }
      lastTranscript = txt;
      resetSilence();
    };

    recognition.onerror = () => {
      clearTimeout(silenceTimer);
      this.toast.add({ severity: 'error', summary: 'Speech Error', detail: 'Recognition failed' });
      this.isListening = false;
      resetSilence();
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      this.isListening = false;
      resetSilence();
    };

    recognition.start();
  }
}
