import { Component } from '@angular/core';
import { SpeechService } from '../../services/speech.service';
import { CommonModule, NgIf } from '@angular/common';
import { OrderParserService } from '../../services/order-parser.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { OrderItem } from '../../models/api-response';
import { SpeechRecorderComponent } from '../speech-recorder/speech-recorder.component';
import { PrintSlipComponent } from '../print-slip/print-slip.component';

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  isRowInValid: boolean;
  audioUrl?: string;
  deleted?: boolean;
}

@Component({
  standalone: true,
  imports: [NgIf, CommonModule, TableModule, FormsModule, ButtonModule, DropdownModule, InputTextModule, SpeechRecorderComponent, PrintSlipComponent],
  selector: 'app-voice-order',
  templateUrl: './voice-order.component.html',
  styleUrls: ['./voice-order.component.scss']
})
export class VoiceOrderComponent {
  recognizedText = '';
  isListening = false;
  parsedOrder: ParsedItem[] = [];
  quantities = Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));

  itemAudios: { [key: number]: Blob } = {};
  fullRecordingAudio: Blob | null = null;
  unMatchedItems: any[] = [];


  constructor(
    private speechService: SpeechService,
    private orderParser: OrderParserService
  ) {
    const testText = "अरहर दाल 5 किलो 2 किलो मूंग दाल 5 लीटर दूध 5 किलो दूध, साबूदाना 10 किलो, चावल 5 किलो, दाल, हरी दाल, हरी दाल 3 किलो, चना दाल 4 किलो, उड़द दाल, मसूर 3 किलो, चावल 5 किलो, आटा 10 किलो, मैदा 2 किलो, चीनी 5 किलो, सेंधा नमक 2 किलो, चाय 2 किलो";
    this.processText(testText);
    this.recognizedText += (this.recognizedText ? '\n' : '') + (testText + ", ");
    this.speechService.speech$.subscribe(text => {
      this.processText(text);
      this.recognizedText += (this.recognizedText ? '\n' : '') + (text + ", ");
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
            name: x.text,
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
      name: item.item.canonical,
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
}
