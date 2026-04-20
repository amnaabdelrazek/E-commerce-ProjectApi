import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/product.model';
import { CreateReviewRequest, Review, UpdateReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Get user's reviews
  getUserReviews(): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.baseUrl}/api/Reviews`);
  }

  // Get reviews for a product
  getProductReviews(productId: number): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.baseUrl}/api/Reviews/product/${productId}`);
  }

  // Create a review
  createReview(review: CreateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.baseUrl}/api/Reviews`, review);
  }

  // Update a review
  updateReview(reviewId: number, review: UpdateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(`${this.baseUrl}/api/Reviews/${reviewId}`, review);
  }

  // Delete a review
  deleteReview(reviewId: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/api/Reviews/${reviewId}`);
  }
}
