import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import Fuse from 'fuse.js';

@Injectable({ providedIn: 'root' })
export class UnitMappingService {
  private unitMap: { [alias: string]: string } = {};
  hindiNumberMap: { [word: string]: number } = {};
  private fuse!: Fuse<{ name: string }>;

  constructor(private http: HttpClient) {}

  async loadMappings(): Promise<void> {
    const unitResponse: any = await firstValueFrom(this.http.get('/assets/data/unit-mappings.json'));
    const numberResponse: any = await firstValueFrom(this.http.get('/assets/data/hindi-number-mappings.json'));
    const itemMappings: any = await firstValueFrom(this.http.get('/assets/data/item-unit-mappings.json'));

    // Load unit aliases
    if (unitResponse && Array.isArray(unitResponse.units)) {
        for (const entry of unitResponse.units) {
          for (const alias of entry.aliases) {
            this.unitMap[alias.toLowerCase()] = entry.normalized;
          }
        }
      } else {
        console.error('Invalid unit-mappings.json format');
      }

    // Load Hindi numbers
    if (numberResponse && numberResponse.numbers) {
        this.hindiNumberMap = numberResponse.numbers;
      } else {
        console.error('Invalid number-mappings.json format');
      }

    // Setup Fuse.js for fuzzy matching items
    this.fuse = new Fuse(itemMappings.items, {
      keys: ['name'],
      threshold: 0.3 // adjust sensitivity
    });
  }

  getUnit(alias: string): string | undefined {
    return this.unitMap[alias.toLowerCase()];
  }

  getNumber(word: string): number | null {
    return this.hindiNumberMap[word] ?? null;
  }
  
  getFuzzyItem(word: string): string | null {
    const result = this.fuse.search(word);
    return result.length ? result[0].item.name : null;
  }
}
