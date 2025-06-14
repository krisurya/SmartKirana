import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  async saveOrder(order: any) {
    const ordersRef = collection(this.firestore, 'orders');
    return await addDoc(ordersRef, order);
  }
}
