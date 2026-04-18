import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Get user's reviews
  getUserReviews(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/api/Reviews`);
  }

  // Get reviews for a product
  getProductReviews(productId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/api/Reviews/product/${productId}`);
  }

  // Create a review
  createReview(review: { productId: number; rating: number; comment: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/Reviews`, review);
  }

  // Update a review
  updateReview(reviewId: number, review: { rating: number; comment: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/api/Reviews/${reviewId}`, review);
  }

  // Delete a review
  deleteReview(reviewId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/api/Reviews/${reviewId}`);
  }
}
