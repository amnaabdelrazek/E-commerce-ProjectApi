import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Get user's wishlist items
  getUserWishlist(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/api/Wishlist`);
  }

  // Add item to wishlist
  addToWishlist(productId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/Wishlist`, { productId });
  }

  // Remove item from wishlist by wishlist ID
  removeFromWishlist(wishlistId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/api/Wishlist/${wishlistId}`);
  }

  // Remove item from wishlist by product ID
  removeFromWishlistByProduct(productId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/api/Wishlist/product/${productId}`);
  }

  // Check if product is in wishlist
  isInWishlist(productId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/api/Wishlist/check/${productId}`);
  }
}
