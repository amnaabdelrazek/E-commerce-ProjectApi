import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ProductResponse, ProductsQuery, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

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

    return this.http.get<ProductsResponse>(`${this.apiBaseUrl}/api/Products`, { params });
  }

  getProductById(id: number) {
    return this.http.get<ProductResponse>(`${this.apiBaseUrl}/api/Products/${id}`);
  }
}
