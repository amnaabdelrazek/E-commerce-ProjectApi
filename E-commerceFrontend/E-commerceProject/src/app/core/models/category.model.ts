import { ApiResponse, PagedResult } from './product.model';

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  productsCount: number;
}

export type CategoriesResponse = ApiResponse<PagedResult<Category>>;
