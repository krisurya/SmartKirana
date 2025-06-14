import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';


// ✅ Import your services and component
import { VoiceOrderComponent } from './components/voice-order/voice-order.component';
import { SpeechService } from './services/speech.service';
import { environment } from '../../environment';
import { FirestoreService } from './services/firestore.service';
import { UnitMappingService } from './services/unit-mapping.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(ReactiveFormsModule),

    // ✅ Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),

    // ✅ Your services
    SpeechService,
    VoiceOrderComponent,
    FirestoreService,
    UnitMappingService,

    // ✅ Optional: if you use routing
    provideRouter([
      {
        path: 'voice-order',
        loadComponent: () => import('./components/voice-order/voice-order.component').then(m => m.VoiceOrderComponent)
      }
    ]),
  ],
};
