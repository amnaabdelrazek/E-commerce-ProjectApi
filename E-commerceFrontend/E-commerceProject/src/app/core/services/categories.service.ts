import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { CategoriesResponse } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getCategories(page = 1, pageSize = 9) {
    const params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);

    return this.http.get<CategoriesResponse>(`${this.apiBaseUrl}/api/Categories`, { params });
  }
}
