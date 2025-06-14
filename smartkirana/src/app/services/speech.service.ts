import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private recognition: any;
  private speechSubject = new Subject<string>();
  speech$ = this.speechSubject.asObservable();

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'hi-IN';
      this.recognition.continuous = true;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('SpeechService: Recognized text:', transcript);
        this.zone.run(() => {
          this.speechSubject.next(transcript);
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // Restart on error to maintain continuity
        if (event.error === 'no-speech' || event.error === 'network') {
          this.restartListening();
        }
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended, restarting...');
        this.restartListening();
      };
    } else {
      console.warn('SpeechRecognition is not supported or not in browser');
    }
  }

  startListening() {
    this.recognition?.start();
  }

  stopListening() {
    this.recognition?.stop();
  }

  private restartListening() {
    setTimeout(() => {
      try {
        this.recognition?.start();
      } catch (err) {
        console.warn('Restart failed, likely already started');
      }
    }, 200); // slight delay to avoid conflicts
  }
}
