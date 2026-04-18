import { ApiResponse } from './../models/product.model';
import { CartItem, PromoCodeRequest, AddToCartResquest, Cart } from './../models/cart';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;


  readonly cartCount = signal(0);

  constructor() {
    this.getCartCount();
  }

  // ================= ADD ITEM =================
  addItem(data: AddToCartResquest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/api/Cart/add-item`,
      data
    ).pipe(
      tap(() => this.getCartCount()) 
    );
  }

  // ================= GET CART ITEMS =================
  getCartItems(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(
      `${this.baseUrl}/api/Cart`
    );
  }

  // ================= REMOVE ITEM =================
  removeCartItem(cartItemId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.baseUrl}/api/Cart/remove-item/${cartItemId}`
    ).pipe(
      tap(() => this.getCartCount()) 
    );
  }

  // ================= CART COUNT =================
  getCartCount(): void {
    this.http.get<ApiResponse<number>>(
      `${this.baseUrl}/api/Cart/count`
    ).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.cartCount.set(res.data);
        }
      },
      error: () => this.cartCount.set(0)
    });
  }

  // ================= CLEAR CART =================
  clearCart(): void {
    this.cartCount.set(0);
  }

  // ================= PROMO CODE =================
  applyPromoCode(request: PromoCodeRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/Checkout/validate-promo`,
      request
    );
  }

  // ================= 🔥 FIXED: CART ID (IMPORTANT) =================

  getCartId(): number {
    const id = localStorage.getItem('cartId');
    return id ? Number(id) : 0;
  }


  setCartId(id: number): void {
    localStorage.setItem('cartId', id.toString());
  }
}