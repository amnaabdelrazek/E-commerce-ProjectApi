// src/app/core/services/paypal.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  private baseUrl = `${environment.apiUrl}/api/PayPal`;

  constructor(private http: HttpClient) {}

  // ================= CREATE PAYMENT =================
  createPayment(orderId: number) {
    return this.http.post<any>(
      `${this.baseUrl}/create?orderId=${orderId}`,
      {}
    );
  }

  // ================= EXECUTE PAYMENT =================
  executePayment(paymentId: string, payerId: string) {
    return this.http.get<any>(
      `${this.baseUrl}/execute?paymentId=${paymentId}&payerId=${payerId}`
    );
  }

  // ================= CANCEL PAYMENT  =================
  cancelPayment(paymentId: string) {
    return this.http.get<any>(
      `${this.baseUrl}/cancel?paymentId=${paymentId}`
    );
  }
}