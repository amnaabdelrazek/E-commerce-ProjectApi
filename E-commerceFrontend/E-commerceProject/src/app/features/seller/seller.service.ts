import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/tokens/api-base-url.token';

export interface SellerCreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  isFeatured?: boolean;
}

export interface SellerUpdateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  isFeatured?: boolean;
}

export interface SellerInventoryItem {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  categoryName: string;
}

export interface GeneralResponse<T> {
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

  private normalizeImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `${this.apiBaseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  }

  private normalizeInventoryItem(item: SellerInventoryItem): SellerInventoryItem {
    return {
      ...item,
      imageUrl: this.normalizeImageUrl(item.imageUrl)
    };
  }

  constructor() { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`);
  }

  getSellerProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  getMyInventory(): Observable<GeneralResponse<SellerInventoryItem[]>> {
    return this.http.get<GeneralResponse<SellerInventoryItem[]>>(`${this.apiBaseUrl}/api/Products/my-inventory`).pipe(
      map((response) => ({
        ...response,
        data: (response.data || []).map((item) => this.normalizeInventoryItem(item))
      }))
    );
  }

  updateStock(productId: number, newQuantity: number): Observable<GeneralResponse<string>> {
    return this.http.patch<GeneralResponse<string>>(
      `${this.apiBaseUrl}/api/Products/${productId}/update-stock`,
      newQuantity
    );
  }

  updateSellerProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData);
  }

  createProduct(productData: SellerCreateProductDto): Observable<GeneralResponse<string | number>> {
    return this.http.post<GeneralResponse<string | number>>(`${this.apiBaseUrl}/api/Products`, productData);
  }

  updateProduct(productId: number, productData: SellerUpdateProductDto): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiBaseUrl}/api/Products/${productId}`, productData);
  }

  deleteProduct(productId: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiBaseUrl}/api/Products/${productId}`);
  }

  uploadProductImage(productId: number, file: File): Observable<GeneralResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<GeneralResponse<string>>(`${this.apiBaseUrl}/api/Products/${productId}/upload-image`, formData);
  }
}
