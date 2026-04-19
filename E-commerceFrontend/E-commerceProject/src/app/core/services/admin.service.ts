
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';

/* ================= COMMON ================= */
export interface GeneralResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

/* ================= USERS ================= */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isLocked: boolean;
  isDeleted: boolean;
}

/* ================= ORDERS ================= */
export interface Order {
  id: number;
  userId: string;
  userFullName: string;
  status: string;
  totalPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  paymentMethod: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  priceAtPurchase: number;
  itemTotal: number;
}

/* ================= COUPONS ================= */
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

/* ================= DASHBOARD ================= */
export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface TopProduct {
  productName: string;
  sales: number;
}

export interface TopBuyer {
  name: string;
  spent: number;
}

export interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalCoupons: number;
  pendingOrders?: number;
  activeUsers?: number;

  monthlyRevenue?: MonthlyRevenue[];
  topProducts?: TopProduct[];
  topBuyers?: TopBuyer[];
}

/* ================= PRODUCTS ================= */
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

/* ================= CATEGORIES ================= */
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

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  // ⚠️ IMPORTANT: your backend uses /api/Admin
  private apiUrl = `${this.baseUrl}/api/Admin`;

  constructor() {}

  /* ================= HELPERS ================= */
  private normalizeImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;

    return `${this.baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
  }

  /* ================= USERS ================= */
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/users`);
}

  lockUser(id: string) {
    return this.http.post(`${this.apiUrl}/lock/${id}`, {});
  }

  unlockUser(id: string) {
    return this.http.post(`${this.apiUrl}/unlock/${id}`, {});
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  changeUserRole(userId: string, newRole: string) {
    return this.http.post(`${this.apiUrl}/role`, { userId, newRole });
  }

  /* ================= ORDERS ================= */
getOrders(): Observable<Order[]> {
  return this.http.get<Order[]>(`${this.apiUrl}/orders`);
}

  updateOrderStatus(orderId: number, status: string) {
    return this.http.put(
      `${this.apiUrl}/orders/${orderId}/status`,
      {},
      { params: { status } }
    );
  }

  /* ================= COUPONS ================= */
getCoupons(): Observable<Coupon[]> { // شيلنا GeneralResponse
  return this.http.get<Coupon[]>(`${this.apiUrl}/coupons`);
}

  createCoupon(dto: CreateCouponDto) {
    return this.http.post<GeneralResponse<Coupon>>(`${this.apiUrl}/coupons`, dto);
  }

  deleteCoupon(id: number) {
    return this.http.delete(`${this.apiUrl}/coupons/${id}`);
  }

  /* ================= PRODUCTS ================= */
  getProducts(
    pageNumber = 1,
    pageSize = 10,
    name = '',
    categoryId?: number,
    minPrice?: number,
    maxPrice?: number
  ) {
    return this.http.get<GeneralResponse<AdminProductsResult>>(
      `${this.baseUrl}/api/Products`,
      {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(name ? { Name: name } : {}),
          ...(categoryId ? { CategoryId: categoryId } : {}),
          ...(minPrice !== undefined ? { MinPrice: minPrice } : {}),
          ...(maxPrice !== undefined ? { MaxPrice: maxPrice } : {})
        }
      }
    ).pipe(
      map(res => ({
        ...res,
        data: {
          ...res.data,
          data: res.data.data.map(p => ({
            ...p,
            imageUrl: this.normalizeImageUrl(p.imageUrl)
          }))
        }
      }))
    );
  }

  createProduct(dto: CreateProductDto) {
    return this.http.post<GeneralResponse<string>>(
      `${this.baseUrl}/api/Products`,
      dto
    );
  }

  updateProduct(id: number, dto: UpdateProductDto) {
    return this.http.put<GeneralResponse<string>>(
      `${this.baseUrl}/api/Products/${id}`,
      dto
    );
  }

  deleteProduct(id: number) {
    return this.http.delete<GeneralResponse<string>>(
      `${this.baseUrl}/api/Products/${id}`
    );
  }

  uploadProductImage(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<GeneralResponse<string>>(
      `${this.baseUrl}/api/Products/${id}/upload-image`,
      formData
    );
  }

  /* ================= CATEGORIES ================= */
  getCategories(page = 1, pageSize = 12, name = '') {
    return this.http.get<GeneralResponse<AdminCategoriesResult>>(
      `${this.baseUrl}/api/Categories`,
      {
        params: {
          Page: page,
          PageSize: pageSize,
          ...(name ? { Name: name } : {})
        }
      }
    ).pipe(
      map(res => ({
        ...res,
        data: {
          ...res.data,
          data: res.data.data.map(c => ({
            ...c,
            imageUrl: this.normalizeImageUrl(c.imageUrl)
          }))
        }
      }))
    );
  }

  createCategory(dto: CreateCategoryDto) {
    return this.http.post<GeneralResponse<string>>(
      `${this.baseUrl}/api/Categories`,
      dto
    );
  }

  updateCategory(id: number, dto: UpdateCategoryDto) {
    return this.http.put<GeneralResponse<string>>(
      `${this.baseUrl}/api/Categories/${id}`,
      dto
    );
  }

  deleteCategory(id: number) {
    return this.http.delete<GeneralResponse<string>>(
      `${this.baseUrl}/api/Categories/${id}`
    );
  }

  uploadCategoryImage(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<GeneralResponse<string>>(
      `${this.baseUrl}/api/Categories/${id}/upload-image`,
      formData
    );
  }

  /* ================= DASHBOARD ================= */
  getDashboard(): Observable<GeneralResponse<DashboardData>> {
    return this.http.get<GeneralResponse<DashboardData>>(
      `${this.apiUrl}/dashboard`
    );
  }
}
