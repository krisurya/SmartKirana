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
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ItemEntryComponent } from './components/item-entry/item-entry.component';
import { UnitEntryComponent } from './components/unit-entry/unit-entry.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    // ✅ Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),

    providePrimeNG({ theme: { preset: Aura } }),
    importProvidersFrom(ReactiveFormsModule),


    // ✅ Your services
    SpeechService,
    VoiceOrderComponent,
    ItemEntryComponent,
    UnitEntryComponent,
    FirestoreService,
    UnitMappingService,

    // ✅ Optional: if you use routing
    provideRouter([
      {
        path: '',
        loadComponent: () => import('./components/unit-entry/unit-entry.component').then(m => m.UnitEntryComponent)
      },
      {
        path: 'voice-order',
        loadComponent: () => import('./components/voice-order/voice-order.component').then(m => m.VoiceOrderComponent)
      },
      {
        path: 'item-entry',
        loadComponent: () => import('./components/item-entry/item-entry.component').then(m => m.ItemEntryComponent)
      },
      {
        path: 'unit-entry',
        loadComponent: () => import('./components/unit-entry/unit-entry.component').then(m => m.UnitEntryComponent)
      }
    ]),
  ],
};
