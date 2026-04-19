import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { Product, ProductResponse, ProductsQuery, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private normalizeImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `${this.apiBaseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  }

  private normalizeProduct(product: Product): Product {
    return {
      ...product,
      imageUrl: this.normalizeImageUrl(product.imageUrl)
    };
  }

  getProducts(query: ProductsQuery = {}) {
    let params = new HttpParams();

    const set = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') return;
      params = params.set(key, String(value));
    };

    set('Name', query.name);
    set('CategoryId', query.categoryId);
    set('MinPrice', query.minPrice);
    set('MaxPrice', query.maxPrice);
    set('PageNumber', query.pageNumber);
    set('PageSize', query.pageSize);
    set('SortBy', query.sortBy);
    set('SortDirection', query.sortDirection);

    return this.http.get<ProductsResponse>(`${this.apiBaseUrl}/api/Products`, { params }).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          data: response.data.data.map((product) => this.normalizeProduct(product))
        }
      }))
    );
  }

  getProductById(id: number) {
    return this.http.get<ProductResponse>(`${this.apiBaseUrl}/api/Products/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.normalizeProduct(response.data) : response.data
      }))
    );
  }
}
