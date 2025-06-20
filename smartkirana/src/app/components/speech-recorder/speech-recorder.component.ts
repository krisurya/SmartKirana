import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // or modular v7+
import { v4 as uuidv4 } from 'uuid';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-speech-recorder',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressBarModule],
  templateUrl: './speech-recorder.component.html',
})
export class SpeechRecorderComponent {
  @Input() label = 'Record';
  @Input() audioUrl: string | null = null;
  @Output() audioUrlChange = new EventEmitter<string>();

  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  audio: HTMLAudioElement | null = null;

  isRecording = signal(false);
  isPlaying = signal(false);
  duration = signal(0);
  progress = signal(0);

  constructor() {}

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audio = new Audio(URL.createObjectURL(audioBlob));
      this.audio.onloadedmetadata = () => this.duration.set(this.audio!.duration);
      this.audio.onended = () => this.isPlaying.set(false);

      this.uploadToFirebase(audioBlob);
    };

    this.mediaRecorder.start();
    this.isRecording.set(true);
  }

  stopRecording() {
    this.mediaRecorder?.stop();
    this.isRecording.set(false);
  }

  togglePlayPause() {
    if (!this.audio) return;

    if (this.isPlaying()) {
      this.audio.pause();
      this.isPlaying.set(false);
    } else {
      this.audio.play();
      this.isPlaying.set(true);
      this.trackProgress();
    }
  }

  private trackProgress() {
    if (!this.audio) return;

    const update = () => {
      const value = (this.audio!.currentTime / this.audio!.duration) * 100;
      this.progress.set(value);
      if (this.isPlaying()) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  private uploadToFirebase(blob: Blob) {
    // const filePath = `recordings/audio-${uuidv4()}.webm`;
    // const ref = this.storage.ref(filePath);
    // const task = this.storage.upload(filePath, blob);

    // task.snapshotChanges().pipe(
    //   finalize(async () => {
    //     const url = await ref.getDownloadURL().toPromise();
    //     this.audioUrl = url;
    //     console.log('✅ Uploaded audio URL:', url);
    //   })
    // ).subscribe();
  }
}
