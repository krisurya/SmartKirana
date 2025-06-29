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
import { SpeechRecorderComponent } from './components/speech-recorder/speech-recorder.component';
import { PrintSlipComponent } from './components/print-slip/print-slip.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomersComponent } from './components/customers/customers.component';
import { SmartKiranaLayoutComponent } from './components/smart-kirana-layout/smart-kirana-layout.component';
import { SpeechEditorCellComponent } from './components/speech-editor-cell/speech-editor-cell.component';
import { CustomerAutocompleteComponent } from './components/app-customer-autocomplete/app-customer-autocomplete.component';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    // ✅ Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),

    providePrimeNG({ theme: { preset: Aura } }),
    importProvidersFrom(ReactiveFormsModule),

    // Services
    MessageService,

    // ✅ Your services
    SpeechService,
    VoiceOrderComponent,
    ItemEntryComponent,
    UnitEntryComponent,
    SpeechRecorderComponent,
    SpeechEditorCellComponent,
    PrintSlipComponent,
    CustomerAutocompleteComponent,
    GlobalLoaderComponent,
    FirestoreService,
    UnitMappingService,

    // ✅ Optional: if you use routing
    provideRouter([
      {
        path: '',
        component: SmartKiranaLayoutComponent,
        children: [
          { path: 'dashboard', component: DashboardComponent },
          { path: 'items', component: ItemEntryComponent },
          { path: 'units', component: UnitEntryComponent },
          { path: 'voice-order', component: VoiceOrderComponent },
          { path: 'customers', component: CustomersComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]),
  ],
};
