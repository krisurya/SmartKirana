import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, DocumentData, query, where, orderBy } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private db = inject(Firestore);
  
  constructor(private firestore: Firestore) {}

  async getUnits(): Promise<any[]> {
    const colRef = collection(this.db, 'units');
    const q = query(
      colRef,
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc')
    );

    const units$ = collectionData(q, { idField: 'id' });
    return await firstValueFrom(units$);
  }

  async getAllPossibleUnits(): Promise<any[]> {
    const units = await this.getUnits();
    return this.appendUnitAlliases(units);
  }

  async fetchAllFromFirestore(
    db: Firestore,
    path: string
  ): Promise<any[]> {
    const colRef = collection(db, path);
    const data$ = collectionData(colRef, { idField: 'id' });
    return await firstValueFrom(data$);
  }

  async saveOrder(order: any) {
    const ordersRef = collection(this.firestore, 'orders');
    return await addDoc(ordersRef, order);
  }

  private appendUnitAlliases(units: (DocumentData | (DocumentData & { id: string; }))[]): { id: any; label: any; value: any; }[] {
    return units.flatMap(u => {
      const baseId = u["id"];
      const main = {
        id: baseId + '-' + u["canonical"],
        label: u["canonical"],
        value: u["canonical"]
      };

      const aliases = (u["aliases"] || []).map((alias: string) => ({
        id: `${baseId}-${alias}`,
        label: alias,
        value: alias
      }));

      var results = [main, ...aliases];
      console.log(results);
      return results;
    });
  }
}
