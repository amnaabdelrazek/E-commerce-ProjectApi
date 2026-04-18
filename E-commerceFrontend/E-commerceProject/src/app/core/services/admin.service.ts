import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  discount: number;
  expiryDate: string;
  isActive: boolean;
  maxUses?: number;
  usedCount?: number;
}

export interface CreateCouponDto {
  code: string;
  discount: number;
  expiryDate: string;
  maxUses?: number;
}

export interface UpdateUserRoleDto {
  userId: string;
  newRole: string;
}

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
  private apiUrl = `${this.baseUrl}/admin`;

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
  getCoupons(): Observable<GeneralResponse<Coupon[]>> {
    return this.http.get<GeneralResponse<Coupon[]>>(`${this.apiUrl}/coupons`);
  }

  createCoupon(dto: CreateCouponDto): Observable<GeneralResponse<Coupon>> {
    return this.http.post<GeneralResponse<Coupon>>(`${this.apiUrl}/coupons`, dto);
  }

  deleteCoupon(id: number): Observable<GeneralResponse<any>> {
    return this.http.delete<GeneralResponse<any>>(`${this.apiUrl}/coupons/${id}`);
  }

  // Dashboard
  getDashboard(): Observable<GeneralResponse<DashboardData>> {
    return this.http.get<GeneralResponse<DashboardData>>(`${this.apiUrl}/dashboard`);
  }
}
