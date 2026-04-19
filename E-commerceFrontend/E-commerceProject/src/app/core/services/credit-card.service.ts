import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CreditCardPaymentRequest {
  orderId: number;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

export interface PaymentResponse {
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreditCardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/CreditCard`;

  processCreditCard(payment: CreditCardPaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.baseUrl}/process`,
      payment
    );
  }
}
