import { Component } from '@angular/core';
import { CustomerAutocompleteComponent } from '../app-customer-autocomplete/app-customer-autocomplete.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CustomerAutocompleteComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
