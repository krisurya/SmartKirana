import { Component } from '@angular/core';
import { SpeechService } from '../../services/speech.service';
import { FirestoreService } from '../../services/firestore.service';
import { NgForOf, NgIf } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { UnitMappingService } from '../../services/unit-mapping.service';
import { OrderParserService } from '../../services/order-parser.service';

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
}

@Component({
  standalone: true,
  imports: [NgIf, NgForOf],
  selector: 'app-voice-order',
  templateUrl: './voice-order.component.html',
  styleUrls: ['./voice-order.component.scss']
})
export class VoiceOrderComponent {
  recognizedText = '';
  items: ParsedItem[] = [];
  isListening = false;
  parsedOrder: any[] = [];

  constructor(
    private speechService: SpeechService,
    private firestoreService: FirestoreService,
    private unitMappingService: UnitMappingService,
    private orderParser: OrderParserService
  ) {
    console.log("VoideOrder: CTOR");
    this.speechService.speech$.subscribe(text => {
      console.log("VoiceOrder: recognized text is: ", text);
      this.orderParser.parseOrder(text).subscribe(
        (res) => {
          this.parsedOrder.push(...res.order);
          console.error('parsed order:', res.order);
        },
        (err) => {
          console.error('Error parsing order:', err);
        }
      );
      this.recognizedText += (this.recognizedText ? '\n' : '') + (text + ", "); // append with new line
      const newItems = this.extractItemsFromText(text); // parse items from new text
      this.items.push(...newItems); // append new items to existing ones
      debugger;
      console.log("VoiceOrder: All Items are: ", this.items);
    });
  }

  startListening() {
    console.log("VoideOrder: startListening");
    this.isListening = true;
    this.speechService.startListening();
  }

  stopListening() {
    console.log("VoideOrder: stopListening");
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

    // if (unit && !isNaN(quantityAlt)) {
    //   const item = this.unitMappingService.getFuzzyItem(words[i]);
    //   if (item) {
    //     items.push({ quantity: quantityAlt, unit, name: item });
    //     i += 2;
    //   }
    // }
  }

  return items;
}


}
