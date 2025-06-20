import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private firestore: Firestore) {}


  async saveOrder(order: any) {
    const ordersRef = collection(this.firestore, 'orders');
    return await addDoc(ordersRef, order);
  }

  /**
   * Fetches all documents from a Firestore collection.
   * @param db - Firestore instance (injected)
   * @param path - Collection path (e.g., 'items')
   * @returns A Promise resolving to an array of documents with IDs
   */
  async fetchAllFromFirestore(
    db: Firestore,
    path: string
  ): Promise<any[]> {
    const colRef = collection(db, path);
    const data$ = collectionData(colRef, { idField: 'id' });
    return await firstValueFrom(data$);
  }
}
