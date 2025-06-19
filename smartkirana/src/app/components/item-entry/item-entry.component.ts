import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';

// ←—— IMPORTANT: all Firestore imports from '@angular/fire/firestore'
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  query,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';

import { firstValueFrom } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    ButtonModule
  ],
  templateUrl: './item-entry.component.html',
  styleUrls: ['./item-entry.component.scss']
})
export class ItemEntryComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private db     = inject(Firestore);

  formArray = this.fb.array<FormGroup>([]);
  loading   = signal(false);

  unitOptions = [
    { label: 'Kilogram', value: 'Kilogram' },
    { label: 'Litre',    value: 'Litre'    },
    { label: 'Piece',    value: 'Piece'    }
  ];

  allAliases = ['दाल','अरहर','तोवर','मूंग','दूध','पानी'];

  async ngOnInit() {
    this.loading.set(true);
    await this.loadItems();
    this.addNewBlankRow();
    this.loading.set(false);
  }

  private createItemRow(item: any = null): FormGroup {
    return this.fb.group({
      itemId:      [{ value: item?.id || '', disabled: true }],
      itemHindi:   [item?.canonical  || '', Validators.required],
      itemEnglish: [item?.english    || '', Validators.required],
      price:       [item?.price      || 0, [Validators.required, Validators.min(1)]],
      unitType:    [item?.unitType   || '', Validators.required],
      aliases:     [item?.aliases    || []],
      createdAt:   [item?.createdAt  || null],
      updatedAt:   [item?.updatedAt  || null]
    });
  }

  private async loadItems() {
    const colRef = collection(this.db, 'items');
    const q      = query(colRef, orderBy('updatedAt','desc'));
    const items$ = collectionData(q, { idField: 'id' });
    const items  = await firstValueFrom(items$);

    this.formArray.clear();
    for (const it of items) {
      this.formArray.push(this.createItemRow(it));
    }
  }

  addNewBlankRow() {
    const blank = this.fb.group({
      itemId:      [{ value: 'Auto', disabled: true }],
      itemHindi:   ['', Validators.required],
      itemEnglish: ['', Validators.required],
      price:       [0, [Validators.required, Validators.min(1)]],
      unitType:    ['', Validators.required],
      aliases:     [[]],
      createdAt:   [null],
      updatedAt:   [null]
    });
    this.formArray.insert(0, blank);
  }

  removeRow(index: number) {
    this.formArray.removeAt(index);
  }

  async saveAll() {
    const top = this.formArray.at(0);
    if (!top?.valid) {
      alert('⚠️ Please fill all required fields in the top row.');
      return;
    }

    const v   = top.getRawValue();
    const now = Timestamp.now();
    const newItem = {
      id:        uuidv4(),
      canonical: v.itemHindi,
      english:   v.itemEnglish,
      price:     v.price,
      unitType:  v.unitType,
      aliases:   v.aliases,
      createdAt: now,
      updatedAt: now
    };

    const colRef = collection(this.db, 'items');
    await addDoc(colRef, newItem);

    alert('✅ Item added!');
    await this.loadItems();
    this.addNewBlankRow();
  }
}
