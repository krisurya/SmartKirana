import { Component,  inject } from '@angular/core';
import { FormBuilder,  Validators,   ReactiveFormsModule,   FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { collection,  collectionData,  Firestore, doc,  getDoc, setDoc} from '@angular/fire/firestore';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { GlobalToastService } from '../../services/toast.service';

@Component({
  selector: 'app-customer-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    DialogModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './app-customer-autocomplete.component.html',
})
export class CustomerAutocompleteComponent {
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  searchTerm: string = '';
  allCustomers: any[] = [];
  filteredCustomers: any[] = [];
  selectedCustomer: any = null;
  addDialogVisible: boolean = false;

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    address: ['', Validators.required]
  });

  constructor(private toastService: GlobalToastService) {
  }

  ngOnInit(){
    this.loadCustomers();
  }

  async loadCustomers() {
    const ref = collection(this.firestore, 'customers');
    collectionData(ref, { idField: 'id' }).subscribe(data => {
      this.allCustomers = data.map(c => ({
        ...c,
        display: `${c["name"]} - ${c["phone"]}`
      }));
      this.filteredCustomers = [...this.allCustomers];
    });
  }

  async addCustomer() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, phone, address } = this.form.value!;
    const normalizedPhone = this.normalizePhone(phone ?? '');

    const customerRef = doc(this.firestore, 'customers', normalizedPhone);

    // Check if customer already exists
    const existingSnap = await getDoc(customerRef);
    if (existingSnap.exists()) {
      const existing = existingSnap.data();
      this.toastService.warn('Duplicate Phone', 'A customer with this phone already exists.');
      this.addDialogVisible = false;
      this.selectedCustomer = { id: normalizedPhone, ...existing };
      this.navigateToVoiceOrder(normalizedPhone);
      return;
    }

    const newCustomer = {
      name,
      phone: normalizedPhone,
      address,
      nameLower: name?.toLowerCase(),
      phoneLower: normalizedPhone.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await setDoc(customerRef, newCustomer); // Uses phone as document ID
      this.toastService.success('Customer Added', 'Customer saved successfully');
      this.addDialogVisible = false;
      this.selectedCustomer = { ...newCustomer, id: normalizedPhone };
      this.navigateToVoiceOrder(normalizedPhone);
    } catch (err) {
      console.error('SetDoc Error:', err);
      this.toastService.success('Error', 'Failed to add customer');
    }
  }

  onCustomerSelect(customer: any) {
    debugger;
    this.selectedCustomer = customer;
    this.navigateToVoiceOrder(customer?.value?.phone);
  }

  onSearch(event: any) {
    const term = event.query?.toLowerCase() || '';
    this.filteredCustomers = this.allCustomers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  }

  showAllCustomers() {
    this.filteredCustomers = [...this.allCustomers];
  }

  showAddDialog() {
    this.addDialogVisible = true;
    this.form.reset();
  }

  updateDialogVisibility(visibility: boolean){
    this.addDialogVisible = visibility;
  }

  onPhoneBlur() {
    const phone = this.form.get('phone')?.value;
    if (phone) {
      const cleaned = this.normalizePhone(phone);
      this.form.get('phone')?.setValue(cleaned);
    }
  }
  normalizePhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '').replace(/^91/, ''); // strips non-digits, removes +91 or 91
  }

  navigateToVoiceOrder(normalizedPhone: string){
    this.router.navigate(['/voice-order'], {
      queryParams: {
        phone: normalizedPhone
      }
    });
  }

}
