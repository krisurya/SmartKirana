import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class OrderParserService {
  private apiUrl = 'http://localhost:8000/parse-order'; // ✅ Correct endpoint

  constructor(private http: HttpClient) {}

  parseOrder(text: string): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, { text });
  }
}
