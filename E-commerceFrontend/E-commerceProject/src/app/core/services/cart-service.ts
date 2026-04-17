import { ApiResponse } from './../models/product.model';
import { CartItem, PromoCodeRequest } from './../models/cart';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AddToCartResquest, Cart } from '../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl;
  readonly cartCount = signal(0);
  constructor() {
    this.getCartCount(); 
  }
  
  clearCart(): void{
    this.cartCount.set(0);
  }
  addItem(data: AddToCartResquest):Observable<ApiResponse<string>>
  {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/api/Cart/add-item`,data);
  }

getCartCount(): void {
  this.http.get<ApiResponse<number>>(`${this.baseUrl}/api/Cart/count`).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.cartCount.set(res.data); 
      }
    },
    error: () => this.cartCount.set(0)
  });
}

getCartItems(): Observable<ApiResponse<Cart>>{
  return this.http.get<ApiResponse<Cart>>(`${this.baseUrl}/api/Cart`)
}

removeCartItem(cartItemId:number): Observable<ApiResponse<string>>
  {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/api/Cart/remove-item/${cartItemId}`);
  }

applyPromoCode(request: PromoCodeRequest): Observable<ApiResponse<any>>{
  return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/Checkout/validate-promo`, request);
}

// getOrderSummary(catId:number, promoCode?:string):Observable<ApiResponse<or>>
// placeOrder(orderData: any): Observable<ApiResponse<any>>{
//   return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/Checkout/user-checkout`,orderData);
// }
}
