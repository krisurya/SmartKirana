import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
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
  private fb = inject(FormBuilder);
  private db = inject(Firestore);

  formArray = this.fb.array<FormGroup>([]);
  loading = signal(false);

  unitOptions = [
    { label: 'Kilogram', value: 'Kilogram' },
    { label: 'Litre',    value: 'Litre'    },
    { label: 'Piece',    value: 'Piece'    }
  ];

  allAliases = [
    'दाल', 'अरहर', 'तोवर', 'मूंग', 'मूंग दाल', 'मूँग दाल',
    'हरी दाल', 'हरी मूंग', 'मूंगी दाल', 'साबुत मूंग',
    'छिलकी मूंग', 'दूध','पानी'
  ];

  async ngOnInit() {
    this.loading.set(true);
    await this.loadItems();
    this.addNewBlankRow();
    this.loading.set(false);
  }

  private createItemRow(item: any = null): FormGroup {
    return this.fb.group({
      docId:       [ item?.docId    || '' ],            // ← Firestore doc ID
      itemId:      [{ value: item?.id || '', disabled: true }],
      itemHindi:   [ item?.canonical  || '', Validators.required ],
      itemEnglish: [ item?.english    || '', Validators.required ],
      price:       [ item?.price      || 0, [Validators.required, Validators.min(1)] ],
      unitType:    [ item?.unitType   || '', Validators.required ],
      aliases:     [ item?.aliases    || [], Validators.required ],
      createdAt:   [ item?.createdAt  || null ],
      updatedAt:   [ item?.updatedAt  || null ]
    });
  }

  private async loadItems() {
    const colRef = collection(this.db, 'items');
    const q      = query(colRef, orderBy('updatedAt','desc'));

    // now populates `docId` from Firestore
    const items$ = collectionData(q, { idField: 'docId' });
    const items  = await firstValueFrom(items$);

    this.formArray.clear();
    for (const it of items) {
      this.formArray.push(this.createItemRow(it));
    }
  }

  addNewBlankRow() {
    const blank = this.fb.group({
      docId:       [''],                              // new row → empty
      itemId:      [{ value: 'Auto Generated', disabled: true }],
      itemHindi:   ['', Validators.required],
      itemEnglish: ['', Validators.required],
      price:       [0, [Validators.required, Validators.min(1)]],
      unitType:    ['', Validators.required],
      aliases:     [[], Validators.required],
      createdAt:   [null],
      updatedAt:   [null]
    });
    this.formArray.insert(0, blank);
  }

  removeRow(index: number) {
    this.formArray.removeAt(index);
  }

  /** only enable when top row valid or any existing row edited+valid */
  get canSaveAll(): boolean {
    const ctrls = this.formArray.controls as FormGroup[];
    const newValid   = ctrls[0]?.valid;
    const editedValid = ctrls.slice(1).some(c => c.dirty && c.valid);
    return newValid || editedValid;
  }

  async saveAll() {
    const ctrls = this.formArray.controls as FormGroup[];

    // 1. new row (index 0)
    if (ctrls[0].valid) {
      await this.upsertRow(ctrls[0]);
      ctrls[0].markAsPristine();
    }

    // 2. edited existing rows
    for (let i = 1; i < ctrls.length; i++) {
      const row = ctrls[i];
      if (row.dirty && row.valid) {
        await this.upsertRow(row);
        row.markAsPristine();
      }
    }

    alert('✅ Changes saved!');
    await this.loadItems();
    this.addNewBlankRow();
  }

  private async upsertRow(ctrl: FormGroup) {
    const v   = ctrl.getRawValue();
    const now = serverTimestamp();

    const payload = {
      canonical: v.itemHindi,
      english:   v.itemEnglish,
      price:     v.price,
      unitType:  v.unitType,
      aliases:   v.aliases,
      updatedAt: now
    };

    if (v.docId) {
      // existing
      const docRef = doc(this.db, 'items', v.docId);
      await updateDoc(docRef, payload);
    } else {
      // new
      await addDoc(collection(this.db, 'items'), {
        ...payload,
        id:        uuidv4(),
        createdAt: now
      });
    }
  }
}
