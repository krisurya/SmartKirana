import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where
} from '@angular/fire/firestore';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-unit-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule
  ],
  templateUrl: './unit-entry.component.html',
  styleUrls: ['./unit-entry.component.scss']
})
export class UnitEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private db = inject(Firestore);
  private firestoreService = inject(FirestoreService);

formArray = this.fb.array<FormGroup>([]);
  loading = signal(false);
  allAliases = ['किलो', 'kg', 'kgs', 'kilogram', 'किलोग्राम', 'लीटर', 'ltr', 'ml', 'पीस', 'unit'];
  mappedAllAliases: { label: string; value: string; }[] = [];

  async ngOnInit() {
    this.mappedAllAliases = this.allAliases.map(a => ({ label: a, value: a }));
    this.loading.set(true);
    await this.loadUnits();
    this.addNewBlankRow();
    this.loading.set(false);
  }

  getFormControl(rowIndex: number, field: string): FormControl {
    return this.formArray.at(rowIndex).get(field) as FormControl;
  }

  private createUnitRow(unit: any = null): FormGroup {
    return this.fb.group({
      docId:     [unit?.id || null],
      unitId:    [{ value: unit?.id || '', disabled: true }],
      canonical: [unit?.canonical || '', Validators.required],
      english:   [unit?.english || '', Validators.required],
      aliases:   [unit?.aliases || [], Validators.required],
      createdAt: [unit?.createdAt || null],
      updatedAt: [unit?.updatedAt || null],
      markedForDelete: [false],
      deletedAt: [null]
    });
  }

  private async loadUnits() {
    const units = await this.firestoreService.getUnits();
    this.formArray.clear();
    for (const u of units) {
      this.formArray.push(this.createUnitRow(u));
    }
  }

  addNewBlankRow() {
    const blank = this.fb.group({
      docId:     [null],
      unitId:    [{ value: 'Auto Generated', disabled: true }],
      canonical: ['', Validators.required],
      english:   ['', Validators.required],
      aliases:   [[], Validators.required],
      createdAt: [null],
      updatedAt: [null],
      markedForDelete: [false]
    });
    this.formArray.insert(0, blank);
  }

  markDeleted(index: number) {
    const row = this.formArray.at(index);
    row.patchValue({ markedForDelete: true });
    row.disable(); // Make the row read-only
  }

  get canSaveAll(): boolean {
    const ctrls = this.formArray.controls as FormGroup[];
    const newValid = ctrls[0]?.get('markedForDelete')?.value === false && ctrls[0]?.valid;

    const editedValid = ctrls.slice(1).some(ctrl =>
      !ctrl.get('markedForDelete')?.value && ctrl.dirty && ctrl.valid
    );

    const hasDeleted = ctrls.slice(1).some(ctrl => ctrl.get('markedForDelete')?.value);

    return newValid || editedValid || hasDeleted;
  }

  async saveAll() {
    const controls = this.formArray.controls as FormGroup[];

    const newRow = controls[0];
    if (newRow.valid && !newRow.get('markedForDelete')?.value) {
      await this.upsertRow(newRow);
      newRow.markAsPristine();
    }

    for (let i = 1; i < controls.length; i++) {
      const row = controls[i];
      const markedForDelete = row.get('markedForDelete')?.value;
      if (markedForDelete) {
        const docId = row.get('docId')?.value;
        if (docId) {
          await this.deleteRowFromFirestore(docId);
        }
      } else if (row.dirty && row.valid) {
        await this.upsertRow(row);
        row.markAsPristine();
      }
    }

    alert('✅ Units saved!');
    await this.loadUnits();
    this.addNewBlankRow();
  }

  private async upsertRow(ctrl: FormGroup) {
    const v = ctrl.getRawValue();
    const now = serverTimestamp();

    const payload = {
      canonical: v.canonical,
      english: v.english,
      aliases: v.aliases,
      updatedAt: now,
      deletedAt: null 
    };

    if (v.docId) {
      const docRef = doc(this.db, 'units', v.docId);
      await updateDoc(docRef, { ...payload });
    } else {
      await addDoc(collection(this.db, 'units'), {
        ...payload,
        id: uuidv4(),
        createdAt: now
      });
    }
  }

  private async deleteRowFromFirestore(docId: string) {
    const docRef = doc(this.db, 'units', docId);
    await updateDoc(docRef, { deletedAt: serverTimestamp() }); // Soft delete, OR:
    // await deleteDoc(docRef); // Uncomment this to perform hard delete
  }
}
