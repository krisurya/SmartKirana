import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataUploadService {
  constructor(private firestore: Firestore, private http: HttpClient) {}

//   async uploadItem(item) {
//     await setDoc(doc(this.firestore, 'items', item.id), item);
//     console.log('✅ Items Upload complete');
//   }

  async uploadItems() {
    const items = await firstValueFrom(this.http.get<any[]>('/assets/data/items.json'));
    for (const item of items) {
      await setDoc(doc(this.firestore, 'items', item.id), item);
    }
    console.log('✅ Items Upload complete');
  }

  async uploadUnits() {
    const units = await firstValueFrom(this.http.get<any[]>('/assets/data/units.json'));
    for (const unit of units) {
      await setDoc(doc(this.firestore, 'units', unit.id), unit);
    }
    console.log('✅ Units Upload complete');
  }

}
