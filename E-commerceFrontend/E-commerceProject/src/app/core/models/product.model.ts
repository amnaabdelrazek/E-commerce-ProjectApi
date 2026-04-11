export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  categoryName: string;
}

export interface PagedResult<T> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  data: T[];
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface ProductsQuery {
  name?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export type ProductsResponse = ApiResponse<PagedResult<Product>>;

export type ProductResponse = ApiResponse<Product>;
