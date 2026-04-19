import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/product.model';
import { CheckoutRequest, OrderSummary } from '../models/order-summary';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getOrderSummary(cartId: number, promo: string): Observable<ApiResponse<OrderSummary>> {
  const body = { 
    cartId: cartId, 
    promoCode: promo || '' 
  };
  
  return this.http.post<ApiResponse<OrderSummary>>(
    `${this.baseUrl}/api/Checkout/calculate-summary`, 
    body
  );
}

  placeOrder(data: CheckoutRequest):Observable<ApiResponse<any>>
  {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/Checkout/user-checkout`,data);
  }

  getUserOrders(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/api/Checkout/my-orders`);
  }

  getOrderById(orderId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/api/Checkout/order/${orderId}`);
  }

  cancelOrder(orderId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/Checkout/cancel-order/${orderId}`, {});
  }
}
