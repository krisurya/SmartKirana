import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class OrderParserService {
  private apiUrl = 'https://smartkirana.onrender.com/parse-order'; // ✅ Correct endpoint

  constructor(private http: HttpClient) {}

  parseOrder(text: string): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, { text });
  }
}
