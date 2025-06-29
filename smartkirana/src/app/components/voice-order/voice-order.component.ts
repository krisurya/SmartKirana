import { Component, inject, ViewChild } from '@angular/core';
import { SpeechService } from '../../services/speech.service';
import { CommonModule, NgIf } from '@angular/common';
import { OrderParserService } from '../../services/order-parser.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { OrderItem } from '../../models/api-response';
import { PrintSlipComponent } from '../print-slip/print-slip.component';
import { SpeechEditorCellComponent } from '../speech-editor-cell/speech-editor-cell.component';
import { FirestoreService } from '../../services/firestore.service';
import { AutoComplete } from 'primeng/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { addDoc, collection, Firestore, Timestamp } from '@angular/fire/firestore';
import { LoaderService } from '../../services/loader.service';
import { GlobalToastService } from '../../services/toast.service';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';

interface ParsedItem {
  id: string,
  canonical: string,
  english: string,
  quantity: number;
  unit: string;
  price: number;
  isRowInValid: boolean;
  audioUrl?: string;
  deleted?: boolean;
}

@Component({
  standalone: true,
  imports: [NgIf, CommonModule, TableModule, FormsModule, ButtonModule, DropdownModule, InputTextModule, PrintSlipComponent, 
    SpeechEditorCellComponent, AutoComplete, ToastModule, DialogModule, CalendarModule, CardModule],
  selector: 'app-voice-order',
  templateUrl: './voice-order.component.html',
  styleUrls: ['./voice-order.component.scss']
})
export class VoiceOrderComponent {
  private firestore = inject(Firestore);
  private fireStoreService = inject(FirestoreService);

  @ViewChild('table') table!: Table;
  recognizedText = '';
  isListening = false;
  parsedOrder: ParsedItem[] = [];
  quantities = Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));

  itemAudios: { [key: number]: Blob } = {};
  fullRecordingAudio: Blob | null = null;
  unMatchedItems: any[] = [];
  filteredUnits: any[] = [];
  unitOptions: any[] = [];
  customerPhone: any;
  audioUrl: string = '';

  // submit order
  paymentDialogVisible = false;
  paidAmount: number = 0;
  remainingAmount: number = 0;
  dueDateTime: Date | null = null;
  paymentModes = [
    { label: '💵 Cash', value: 'cash' },
    { label: '🏦 UPI', value: 'upi' },
    { label: '📄 Credit', value: 'credit' }
  ];
  paymentMode: string = 'cash';
  selectedCustomer: { name: string; phone: string; };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private speechService: SpeechService,
    private orderParser: OrderParserService,
    private loader: LoaderService,
    private toastService: GlobalToastService
  ) {
    this.selectedCustomer = {name: '', phone: ''};
    // 5 किलो अरहर दाल, मूंग दाल 3 किलो, चावल 5 किलो, साबूदाना 2 किलो, चना दाल 10 किलो, अजवाइन 100 ग्राम, अजवाइन प्रोग्राम, होता है या ग्राम होता है, होता है या ग्राम होता है अब इसमें जो वैलिड आइटम है ना सिर्फ उनकी रिसिप्ट बनकर आ रही है, जैसे देखो, रिफ्रेश पेज स्टोर
    const testText = "अरहर दाल 5 किलो 2 किलो मूंग दाल 5 लीटर दूध 5 किलो दूध, साबूदाना 10 किलो, चावल 5 किलो, दाल, हरी दाल, हरी दाल 3 किलो, चना दाल 4 किलो, उड़द दाल, मसूर 3 किलो, चावल 5 किलो, आटा 10 किलो, मैदा 2 किलो, चीनी 5 किलो, सेंधा नमक 2 किलो, चाय 2 किलो";
    this.processText(testText);
    this.recognizedText += (this.recognizedText ? '\n' : '') + (testText + ", ");
    this.speechService.speech$.subscribe(text => {
      this.processText(text);
      this.recognizedText += (this.recognizedText ? '\n' : '') + (text + ", ");
    });
  }

  async ngOnInit(){
    this.unitOptions = await this.fireStoreService.getAllPossibleUnits();
    this.route.queryParams.subscribe(params => {
      this.customerPhone = params['phone'];
      if (this.customerPhone || this.customerPhone.length > 0) {
        this.selectedCustomer = {name: this.customerPhone, phone: this.customerPhone};
        debugger;
        // optionally prefill customer or fetch details by phone
      }
    });
  }

  processText(text: string) {
    this.orderParser.parseOrder(text).subscribe(
      (res) => {
        const parsedItems = this.mapParsedOrdersToUI(res.order.order);
        this.parsedOrder.push(...parsedItems);
        // this.validOrders.push(...parsedItems);
        this.parsedOrder.push(...res.order.unMatched.map((x) => { 
          const item: ParsedItem = {
            id: '',
            canonical: x.text,
            english: '',
            quantity: 0,
            unit: '',
            price: 0,
            isRowInValid: true,
            audioUrl: ''
          };
          return item;
         }));
        console.log(this.parsedOrder);
      },
      (err) => {
        console.error('Error parsing order:', err);
      }
    );
  }

  startListening() {
    this.isListening = true;
    this.speechService.startListening();
  }

  stopListening() {
    this.isListening = false;
    this.speechService.stopListening();
  }

  mapParsedOrdersToUI(parsedOrders: OrderItem[]): ParsedItem[] {
    return parsedOrders.map((item): ParsedItem => ({
      id: item.item.id,
      canonical: item.item.canonical,
      english: item.item.english,
      quantity: item.qty,
      unit: item.unit.canonical,
      price: item.item.price,
      audioUrl: undefined,
      isRowInValid: false
    }));
  }

  toggleRowVisibility(row: ParsedItem) {
    row.deleted = !row.deleted;
  }

  getRowClass(row: any): string {
    return row.isRowInvalid ? 'invalid-row' : '';
  }

  get validOrder(): ParsedItem[]{
    return this.parsedOrder.filter(x => x.price > 0 && x.quantity > 0 && !x.deleted);
  }

  startVoiceInput(row: any): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi recognition
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      row.canonical = transcript;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };

    recognition.start();
  }

  activateEdit(row: any) {
    this.table.initRowEdit(row);
  }

  filterUnits(event: any) {
    const query = event.query.toLowerCase();
    this.filteredUnits = this.unitOptions.filter(unit =>
      unit.label.toLowerCase().includes(query)
    );
  }

  get calculatedTotal(): number {
    return this.validOrder.reduce((sum, item) => sum + ((item.price * item.quantity) || 0), 0);
  }

  openPaymentDialog() {
    const total = this.calculatedTotal;
    this.paidAmount = total;
    this.remainingAmount = 0;

    if (this.customerPhone === '1234567890') {
      this.dueDateTime = this.getFutureDate(7); // 7 days for specific customer
    } else {
      this.dueDateTime = this.getFutureDate(30); // default 1 month
    }

    this.paymentDialogVisible = true;
  }

  getFutureDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  calculateRemaining() {
    this.remainingAmount = Math.max(this.calculatedTotal - this.paidAmount, 0);
  }

  async saveVoiceOrder() {
    this.loader.show();
    try {
        const total = this.calculatedTotal;
        const paid = this.paidAmount;
        const remaining = total - paid;
        const totalAmount = this.validOrder.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0);
        const order = {
        customer: {
          name: this.selectedCustomer.name,
          phone: this.selectedCustomer.phone
        },
        customerId: this.selectedCustomer.phone,
        items: {
            validItems: this.validOrder.map(item => ({
                          id: item.id,
                          canonical: item.canonical,
                          english: item.english,
                          price: item.price,
                          unitTypes: item.unit,
                          quantity: item.quantity ?? 1 // if quantity comes from UI
                        })),
            allItems: this.parsedOrder.map(item => ({
                          id: item.id,
                          canonical: item.canonical,
                          english: item.english,
                          price: item.price,
                          unitTypes: item.unit,
                          quantity: item.quantity ?? 1 // if quantity comes from UI
                        }))
        },
        recognizedText: this.recognizedText,
        audioUrl: this.audioUrl || null,
        totalAmount: totalAmount,
        totalQuantity: this.validOrder.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
        status: 'done',
        paymentStatus: remaining === 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid'),
        paymentMode: this.paymentMode,
        paidAmount: paid,
        remainingAmount: remaining,
        paymentHistory: [{
          amount: paid,
          mode: 'cash', // or dynamic
          time: new Date().toISOString()
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const ref = collection(this.firestore, 'orders');
      const docRef = await addDoc(ref, order);
      this.toastService.success('Order Saved', `Order ID: ${docRef.id}`);
      this.loader.hide();
      this.paymentDialogVisible = false;
      return docRef.id;
    } catch (err) {
      console.error('Error saving order:', err);
      this.toastService.error('Error', 'Failed to save order');

      this.loader.hide();
      throw err;
    }
  }

  goToCustomerOrders() {
    if (this.selectedCustomer?.phone) {
      this.router.navigate(['/customer-orders'], {
        queryParams: { phone: this.selectedCustomer.phone }
      });
    }
  }
}
