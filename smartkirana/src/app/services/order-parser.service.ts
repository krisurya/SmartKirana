import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  qty: number;
  item: string;
  unit: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderParserService {
  private apiUrl = 'http://localhost:8000/parse-order'; // ✅ Correct endpoint

  constructor(private http: HttpClient) {}

  parseOrder(text: string): Observable<{ order: OrderItem[] }> {
    return this.http.post<{ order: OrderItem[] }>(this.apiUrl, { text });
  }
}
