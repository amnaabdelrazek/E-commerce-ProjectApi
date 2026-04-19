import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/tokens/api-base-url.token';

export interface SellerCreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  isFeatured?: boolean;
}

interface GeneralResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  
  private apiUrl = `${this.apiBaseUrl}/api/Seller`;

  constructor() { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`);
  }

  getSellerProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateSellerProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData);
  }

  createProduct(productData: SellerCreateProductDto): Observable<GeneralResponse<string | number>> {
    return this.http.post<GeneralResponse<string | number>>(`${this.apiBaseUrl}/api/Products`, productData);
  }

  uploadProductImage(productId: number, file: File): Observable<GeneralResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<GeneralResponse<string>>(`${this.apiBaseUrl}/api/Products/${productId}/upload-image`, formData);
  }
}
