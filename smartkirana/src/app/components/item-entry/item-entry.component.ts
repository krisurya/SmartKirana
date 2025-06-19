import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
  DocumentData
} from '@angular/fire/firestore';

import { firstValueFrom } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
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
    AutoCompleteModule ,
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

  unitOptions: { id:any, label: any; value: any; }[] = [];
  allAliases = ['दाल','अरहर','तोवर','मूंग','मूंग दाल','मूँग दाल','हरी दाल','हरी मूंग','मूंगी दाल','साबुत मूंग','छिलकी मूंग','दूध','पानी'];
  filteredAliases: string[] = [];

  async ngOnInit() {
    this.loading.set(true);
    await this.loadUnits();
    await this.loadItems();
    this.addNewBlankRow();
    this.loading.set(false);
  }

  private createItemRow(item: any = null): FormGroup {
    return this.fb.group({
      docId:       [item?.docId || ''],
      itemId:      [{ value: item?.id || '', disabled: true }],
      itemHindi:   [item?.canonical || '', Validators.required],
      itemEnglish: [item?.english || '', Validators.required],
      price:       [item?.price || 0, [Validators.required, Validators.min(1)]],
      unitType:    [item?.unitType || [], Validators.required],
      aliases:     [item?.aliases || [], Validators.required],
      createdAt:   [item?.createdAt || null],
      updatedAt:   [item?.updatedAt || null],
      deleted:     [false]  // NEW: to track soft delete
    });
  }

  private async loadUnits() {
    const colRef = collection(this.db, 'units');
    const q = query(
      colRef,
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc')
    );

    const units$ = collectionData(q, { idField: 'id' });
    const units = await firstValueFrom(units$);
    this.unitOptions = this.getAllPossibleUnits(units);
  }

  getAllPossibleUnits(units: (DocumentData | (DocumentData & { id: string; }))[]): { id: any; label: any; value: any; }[] {
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
    
  private async loadItems() {
    const colRef = collection(this.db, 'items');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const items$ = collectionData(q, { idField: 'docId' });
    const items = await firstValueFrom(items$);

    this.formArray.clear();
    for (var it of items) {

      it["unitType"] = it["unitType"].flatMap((u: string) => {
        return this.unitOptions
          .filter(opt => opt.id.startsWith(u))
          .map(opt => opt.id);
      });

      this.formArray.push(this.createItemRow(it));
    }
  }

  addNewBlankRow() {
    const blank = this.fb.group({
      docId: [''],
      itemId: [{ value: 'Auto Generated', disabled: true }],
      itemHindi: ['', Validators.required],
      itemEnglish: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      unitType: ['', Validators.required],
      aliases: [[], Validators.required],
      createdAt: [null],
      updatedAt: [null],
      deleted: [false]
    });
    this.formArray.insert(0, blank);
  }

  markDeleted(index: number) {
    const row = this.formArray.at(index);
    row.patchValue({ deleted: true });
    row.disable(); // Make the row read-only
  }

  get canSaveAll(): boolean {
    const ctrls = this.formArray.controls as FormGroup[];
    const newValid = ctrls[0]?.get('deleted')?.value === false && ctrls[0]?.valid;

    const editedValid = ctrls.slice(1).some(ctrl =>
      !ctrl.get('deleted')?.value && ctrl.dirty && ctrl.valid
    );

    const hasDeleted = ctrls.slice(1).some(ctrl => ctrl.get('deleted')?.value);

    return newValid || editedValid || hasDeleted;
  }

  async saveAll() {
    const ctrls = this.formArray.controls as FormGroup[];

    // 1. New row (insert)
    const newRow = ctrls[0];
    if (!newRow.get('deleted')?.value && newRow.valid) {
      await this.upsertRow(newRow);
      newRow.markAsPristine();
    }

    // 2. Existing rows (update or delete)
    for (let i = 1; i < ctrls.length; i++) {
      const row = ctrls[i];
      const v = row.getRawValue();
      const docId = v.docId;

      if (v.deleted && docId) {
        await deleteDoc(doc(this.db, 'items', docId));
      } else if (!v.deleted && row.dirty && row.valid && docId) {
        await this.upsertRow(row);
        row.markAsPristine();
      }
    }

    alert('✅ Changes saved!');
    await this.loadItems();
    this.addNewBlankRow();
  }

  private async upsertRow(ctrl: FormGroup) {
    const v = ctrl.getRawValue();
    const now = serverTimestamp();

    debugger;
    const payload = {
      canonical: v.itemHindi,
      english: v.itemEnglish,
      price: v.price,
      unitType: v.unitType,
      aliases: v.aliases,
      updatedAt: now
    };

    if (v.docId) {
      const docRef = doc(this.db, 'items', v.docId);
      await updateDoc(docRef, payload);
    } else {
      await addDoc(collection(this.db, 'items'), {
        ...payload,
        id: uuidv4(),
        createdAt: now
      });
    }
  }

  filterAliases(event: any) {
    const typed = event.query?.trim();
    if (!typed) {
      this.filteredAliases = [...this.allAliases];
      return;
    }

    const lowerTyped = typed.toLowerCase();

    const matches = this.allAliases.filter(alias =>
      alias.toLowerCase().includes(lowerTyped)
    );

    const alreadyExists = this.allAliases.some(
      alias => alias.toLowerCase() === lowerTyped
    );

    this.filteredAliases = alreadyExists ? matches : [typed, ...matches];
  }

  normalizeAliases(rowIndex: number) {
    const control = this.getFormControl(rowIndex, 'aliases');
    const raw = (control.value || []) as string[];

    // Deduplicate case-insensitively while keeping original case of first occurrence
    const seen = new Map<string, string>();

    for (const alias of raw) {
      const trimmed = alias.trim();
      const key = trimmed.toLowerCase();
      if (trimmed && !seen.has(key)) {
        seen.set(key, trimmed);
      }
    }

    const cleaned = Array.from(seen.values());
    control.setValue(cleaned);

    // Add to global alias list if not already present (case-insensitive)
    for (const alias of cleaned) {
      const aliasLower = alias.toLowerCase();
      if (!this.allAliases.some(a => a.toLowerCase() === aliasLower)) {
        this.allAliases.push(alias);
      }
    }
  }

  getFormControl(rowIndex: number, field: string): FormControl {
    return this.formArray.at(rowIndex).get(field) as FormControl;
  }
  
}
