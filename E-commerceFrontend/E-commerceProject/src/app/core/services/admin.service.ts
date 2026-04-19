import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';

export interface GeneralResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Order {
  id: number;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Coupon {
  id: number;
  code: string;
  discountAmount: number | null;     // نفس اسم الباك إند
  discountPercentage: number | null; // نفس اسم الباك إند
  expiryDate: string;
  isActive: boolean;
  minimumPurchaseAmount: number;
  maxUses?: number;
  usedCount?: number;
}

export interface CreateCouponDto {
  code: string;
  minimumPurchaseAmount: number;
  expiryDate: string;
  discountPercentage: number | null; 
  discountAmount: number | null;
  maxUses?: number;
}

export interface UpdateUserRoleDto {
  userId: string;
  newRole: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  categoryName: string;
}

export interface AdminProductsResult {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  data: AdminProduct[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
}

export interface UpdateProductDto extends CreateProductDto {}

export interface AdminCategory {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  productsCount: number;
}

export interface AdminCategoriesResult {
  totalItems: number;
  page: number;
  pageSize: number;
  data: AdminCategory[];
}

export interface CreateCategoryDto {
  name: string;
  description: string;
}

export interface UpdateCategoryDto extends CreateCategoryDto {}

export interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalCoupons: number;
  pendingOrders?: number;
  activeUsers?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private apiUrl = `${this.baseUrl}/api/Admin`;

  private normalizeImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `${this.baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  }

  // Users Management
  getUsers(): Observable<GeneralResponse<User[]>> {
    return this.http.get<GeneralResponse<User[]>>(`${this.apiUrl}/users`);
  }

  lockUser(id: string): Observable<GeneralResponse<any>> {
    return this.http.post<GeneralResponse<any>>(`${this.apiUrl}/lock/${id}`, {});
  }

  unlockUser(id: string): Observable<GeneralResponse<any>> {
    return this.http.post<GeneralResponse<any>>(`${this.apiUrl}/unlock/${id}`, {});
  }

  deleteUser(id: string): Observable<GeneralResponse<any>> {
    return this.http.delete<GeneralResponse<any>>(`${this.apiUrl}/users/${id}`);
  }

  changeUserRole(userId: string, newRole: string): Observable<GeneralResponse<any>> {
    const dto: UpdateUserRoleDto = { userId, newRole };
    return this.http.post<GeneralResponse<any>>(`${this.apiUrl}/role`, dto);
  }

  // Orders Management
  getOrders(): Observable<GeneralResponse<Order[]>> {
    return this.http.get<GeneralResponse<Order[]>>(`${this.apiUrl}/orders`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(
      `${this.apiUrl}/orders/${orderId}/status?status=${status}`,
      {}
    );
  }

  // Coupons Management
// admin.service.ts
getCoupons(): Observable<Coupon[]> { // شيلنا GeneralResponse
  return this.http.get<Coupon[]>(`${this.apiUrl}/coupons`);
}

  createCoupon(dto: CreateCouponDto): Observable<GeneralResponse<Coupon>> {
    return this.http.post<GeneralResponse<Coupon>>(`${this.apiUrl}/coupons`, dto);
  }

  deleteCoupon(id: number): Observable<GeneralResponse<any>> {
    return this.http.delete<GeneralResponse<any>>(`${this.apiUrl}/coupons/${id}`);
  }

  // Products Management
  getProducts(
    pageNumber = 1,
    pageSize = 10,
    name = '',
    categoryId?: number,
    minPrice?: number,
    maxPrice?: number
  ): Observable<GeneralResponse<AdminProductsResult>> {
    return this.http.get<GeneralResponse<AdminProductsResult>>(`${this.baseUrl}/api/Products`, {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...(name ? { Name: name } : {}),
        ...(categoryId ? { CategoryId: categoryId } : {}),
        ...(minPrice !== undefined ? { MinPrice: minPrice } : {}),
        ...(maxPrice !== undefined ? { MaxPrice: maxPrice } : {})
      }
    }).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          data: response.data.data.map(product => ({
            ...product,
            imageUrl: this.normalizeImageUrl(product.imageUrl)
          }))
        }
      }))
    );
  }

  getProductById(id: number): Observable<GeneralResponse<AdminProduct>> {
    return this.http.get<GeneralResponse<AdminProduct>>(`${this.baseUrl}/api/Products/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data
          ? {
              ...response.data,
              imageUrl: this.normalizeImageUrl(response.data.imageUrl)
            }
          : response.data
      }))
    );
  }

  createProduct(dto: CreateProductDto): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.baseUrl}/api/Products`, dto);
  }

  updateProduct(id: number, dto: UpdateProductDto): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.baseUrl}/api/Products/${id}`, dto);
  }

  deleteProduct(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.baseUrl}/api/Products/${id}`);
  }

  uploadProductImage(id: number, file: File): Observable<GeneralResponse<string | null>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<GeneralResponse<string>>(`${this.baseUrl}/api/Products/${id}/upload-image`, formData).pipe(
      map(response => ({
        ...response,
        data: this.normalizeImageUrl(response.data)
      }))
    );
  }

  // Categories Management
  getCategories(page = 1, pageSize = 12, name = ''): Observable<GeneralResponse<AdminCategoriesResult>> {
    return this.http.get<GeneralResponse<AdminCategoriesResult>>(`${this.baseUrl}/api/Categories`, {
      params: {
        Page: page,
        PageSize: pageSize,
        ...(name ? { Name: name } : {})
      }
    }).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          data: response.data.data.map(category => ({
            ...category,
            imageUrl: this.normalizeImageUrl(category.imageUrl)
          }))
        }
      }))
    );
  }

  getCategoryById(id: number): Observable<GeneralResponse<AdminCategory | null>> {
    return this.http.get<GeneralResponse<AdminCategory | null>>(`${this.baseUrl}/api/Categories/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data
          ? {
              ...response.data,
              imageUrl: this.normalizeImageUrl(response.data.imageUrl)
            }
          : null
      }))
    );
  }

  createCategory(dto: CreateCategoryDto): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.baseUrl}/api/Categories`, dto);
  }

  updateCategory(id: number, dto: UpdateCategoryDto): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.baseUrl}/api/Categories/${id}`, dto);
  }

  deleteCategory(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.baseUrl}/api/Categories/${id}`);
  }

  uploadCategoryImage(id: number, file: File): Observable<GeneralResponse<string | null>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<GeneralResponse<string>>(`${this.baseUrl}/api/Categories/${id}/upload-image`, formData).pipe(
      map(response => ({
        ...response,
        data: this.normalizeImageUrl(response.data)
      }))
    );
  }

  // Dashboard
  getDashboard(): Observable<GeneralResponse<DashboardData>> {
    return this.http.get<GeneralResponse<DashboardData>>(`${this.apiUrl}/dashboard`);
  }
}
