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
import { SpeechEditorCellComponent } from './components/speech-editor-cell/speech-editor-cell.component';
import { CustomerAutocompleteComponent } from './components/app-customer-autocomplete/app-customer-autocomplete.component';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { MessageService } from 'primeng/api';
import { authGuard } from './services/auth.guard';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { SmartKiranaLayoutComponent } from './components/smart-kirana-layout/smart-kirana-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    // ✅ Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
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
      path: 'login',
      loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
    },
    {
      path: '',
      component: SmartKiranaLayoutComponent,
      canActivate: [authGuard],
      children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        {
          path: 'dashboard',
          loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
        },
        {
          path: 'items',
          loadComponent: () => import('./components/item-entry/item-entry.component').then(m => m.ItemEntryComponent)
        },
        {
          path: 'units',
          loadComponent: () => import('./components/unit-entry/unit-entry.component').then(m => m.UnitEntryComponent)
        },
        {
          path: 'voice-order',
          loadComponent: () => import('./components/voice-order/voice-order.component').then(m => m.VoiceOrderComponent)
        },
        {
          path: 'customers',
          loadComponent: () => import('./components/customers/customers.component').then(m => m.CustomersComponent)
        },
        {
          path: 'customer-orders',
          loadComponent: () => import('./components/customer-orders/customer-orders.component').then(m => m.CustomerOrdersComponent)
        }
      ]
    }
  ]),
  ],
};
