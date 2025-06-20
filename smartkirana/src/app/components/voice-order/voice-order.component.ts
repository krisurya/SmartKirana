import { Component } from '@angular/core';
import { SpeechService } from '../../services/speech.service';
import { FirestoreService } from '../../services/firestore.service';
import { NgForOf, NgIf } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { UnitMappingService } from '../../services/unit-mapping.service';
import { OrderParserService } from '../../services/order-parser.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { OrderItem } from '../../models/api-response';

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  audioUrl?: string;
}

@Component({
  standalone: true,
  imports: [NgIf, NgForOf, TableModule, FormsModule, ButtonModule, DropdownModule, InputTextModule],
  selector: 'app-voice-order',
  templateUrl: './voice-order.component.html',
  styleUrls: ['./voice-order.component.scss']
})
export class VoiceOrderComponent {
  recognizedText = '';
  items: ParsedItem[] = [];
  isListening = false;
  parsedOrder: any[] = [];
  quantities = Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));

  itemAudios: { [key: number]: Blob } = {};
  fullRecordingAudio: Blob | null = null;


  constructor(
    private speechService: SpeechService,
    private firestoreService: FirestoreService,
    private unitMappingService: UnitMappingService,
    private orderParser: OrderParserService
  ) {
    this.speechService.speech$.subscribe(text => {
      this.orderParser.parseOrder(text).subscribe(
        (res) => {
          const parsedItems = this.mapParsedOrdersToUI(res.order.order);
          this.parsedOrder.push(...parsedItems);
          
          console.log(this.parsedOrder);
        },
        (err) => {
          console.error('Error parsing order:', err);
        }
      );
      this.recognizedText += (this.recognizedText ? '\n' : '') + (text + ", "); // append with new line
      const newItems = this.extractItemsFromText(text); // parse items from new text
      this.items.push(...newItems); // append new items to existing ones
    });
  }

  startListening() {
    this.isListening = true;
    this.speechService.startListening();
  }

  stopListening() {
    this.isListening = false;
    this.speechService.stopListening();
  }

  async submitOrder() {
    if (this.items.length) {
      const order = {
        items: this.items,
        createdAt: new Date(),
        status: 'pending'
      };
      await this.firestoreService.saveOrder(order);
      alert('Order saved!');
      this.recognizedText = '';
      this.items = [];
    }
  }

  private extractItemsFromText(text: string): ParsedItem[] {
    const words = text.toLowerCase().split(/[\s,]+/);
    const items: ParsedItem[] = [];

    for (let i = 0; i < words.length - 2; i++) {
      let quantity = parseFloat(words[i]);
      if (isNaN(quantity)) {
        quantity = this.unitMappingService.hindiNumberMap[words[i]] ?? NaN;
      }

      if (!isNaN(quantity)) {
        const unit = this.unitMappingService.getUnit(words[i + 1]);
        const item = this.unitMappingService.getFuzzyItem(words[i + 2]);
        if (unit && item) {
          items.push({ quantity, unit, name: item });
          i += 2;
          continue;
        }
      }

      // Handle case: item + unit + quantity (e.g., चावल किलो 1)
      const unit = this.unitMappingService.getUnit(words[i + 1]);
      const quantityAlt = parseFloat(words[i + 2]) || this.unitMappingService.hindiNumberMap[words[i + 2]];
      const item = this.unitMappingService.getFuzzyItem(words[i]);
      if (item) {
        items.push({ quantity: quantityAlt ? quantityAlt : 0, unit: unit ? unit : 'XX', name: item ? item : 'XXXX' });
        i += 2;
      }
    }

    return items;
  }


  recordItemAudio(index: number) {
    debugger;
    // this.speechService.startItemRecording(index); // Implement in speechService
  }

  playItemAudio(index: number) {
    const audio = this.itemAudios[index];
    if (audio) {
      const url = URL.createObjectURL(audio);
      const audioObj = new Audio(url);
      audioObj.play();
    }
  }

  pauseItemAudio(index: number) {
    // optional: store the audio instance and pause it
  }

  playFullAudio() {
    if (this.fullRecordingAudio) {
      const url = URL.createObjectURL(this.fullRecordingAudio);
      const audio = new Audio(url);
      audio.play();
    }
  }

  pauseFullAudio() {
    // optional: pause full recording
  }

  mapParsedOrdersToUI(parsedOrders: OrderItem[]): ParsedItem[] {
    return parsedOrders.map((item): ParsedItem => ({
      name: item.item.canonical,        // or item.item.english if preferred
      quantity: item.qty,
      unit: item.unit.canonical,        // or item.unit.english if preferred
      audioUrl: undefined               // optionally attach recording later
    }));
  }

}
