import { Injectable, NgZone, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { TokenStorageService } from './token-storage.service';

export interface ReviewChangedEvent {
  action: string;
  productId: number;
  reviewId?: number;
  review?: unknown;
}

export interface UserReviewsChangedEvent extends ReviewChangedEvent {}

export interface CartChangedEvent {
  count: number;
}

export interface WishlistChangedEvent {
  action: string;
  productId?: number;
}

export interface OrdersChangedEvent {
  action: string;
  orderId: number;
  status: string;
}

export interface ProductInventoryChangedEvent {
  productId: number;
  stockQuantity: number;
}

export interface RealtimeReasonEvent {
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly ngZone = inject(NgZone);

  private connection: HubConnection | null = null;
  private activeToken: string | null = null;
  private readonly joinedProductIds = new Set<number>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isStarting = false;

  private readonly reviewsChangedSubject = new Subject<ReviewChangedEvent>();
  private readonly userReviewsChangedSubject = new Subject<UserReviewsChangedEvent>();
  private readonly cartChangedSubject = new Subject<CartChangedEvent>();
  private readonly wishlistChangedSubject = new Subject<WishlistChangedEvent>();
  private readonly ordersChangedSubject = new Subject<OrdersChangedEvent>();
  private readonly productInventoryChangedSubject = new Subject<ProductInventoryChangedEvent>();
  private readonly adminDashboardChangedSubject = new Subject<RealtimeReasonEvent>();
  private readonly adminOrdersChangedSubject = new Subject<OrdersChangedEvent>();
  private readonly adminCouponsChangedSubject = new Subject<{ action: string; couponId?: number }>();
  private readonly adminUsersChangedSubject = new Subject<{ action: string; userId?: string }>();
  private readonly adminSellersChangedSubject = new Subject<{ action: string; sellerId?: number; sellerUserId?: string }>();
  private readonly sellerDashboardChangedSubject = new Subject<RealtimeReasonEvent>();

  readonly reviewsChanged$: Observable<ReviewChangedEvent> = this.reviewsChangedSubject.asObservable();
  readonly userReviewsChanged$: Observable<UserReviewsChangedEvent> = this.userReviewsChangedSubject.asObservable();
  readonly cartChanged$: Observable<CartChangedEvent> = this.cartChangedSubject.asObservable();
  readonly wishlistChanged$: Observable<WishlistChangedEvent> = this.wishlistChangedSubject.asObservable();
  readonly ordersChanged$: Observable<OrdersChangedEvent> = this.ordersChangedSubject.asObservable();
  readonly productInventoryChanged$: Observable<ProductInventoryChangedEvent> = this.productInventoryChangedSubject.asObservable();
  readonly adminDashboardChanged$: Observable<RealtimeReasonEvent> = this.adminDashboardChangedSubject.asObservable();
  readonly adminOrdersChanged$: Observable<OrdersChangedEvent> = this.adminOrdersChangedSubject.asObservable();
  readonly adminCouponsChanged$: Observable<{ action: string; couponId?: number }> = this.adminCouponsChangedSubject.asObservable();
  readonly adminUsersChanged$: Observable<{ action: string; userId?: string }> = this.adminUsersChangedSubject.asObservable();
  readonly adminSellersChanged$: Observable<{ action: string; sellerId?: number; sellerUserId?: string }> = this.adminSellersChangedSubject.asObservable();
  readonly sellerDashboardChanged$: Observable<RealtimeReasonEvent> = this.sellerDashboardChangedSubject.asObservable();

  async syncConnection(): Promise<void> {
    const token = this.tokenStorage.getToken();

    if (
      this.connection &&
      this.activeToken === token &&
      this.connection.state !== HubConnectionState.Disconnected
    ) {
      return;
    }

    this.clearReconnectTimer();
    await this.stopConnection();
    await this.startConnection(token);
  }

  async joinProductGroup(productId: number): Promise<void> {
    if (productId <= 0) {
      return;
    }

    this.joinedProductIds.add(productId);

    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.invoke('JoinProductGroup', productId);
    }
  }

  async leaveProductGroup(productId: number): Promise<void> {
    if (productId <= 0) {
      return;
    }

    this.joinedProductIds.delete(productId);

    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.invoke('LeaveProductGroup', productId);
    }
  }

  private async startConnection(token: string | null): Promise<void> {
    if (this.isStarting) {
      return;
    }

    this.isStarting = true;
    this.activeToken = token;

    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.apiBaseUrl}/hubs/commerce`, {
        accessTokenFactory: () => this.tokenStorage.getToken() ?? '',
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    this.registerConnectionHandlers(this.connection);

    try {
      await this.connection.start();
      await this.rejoinProductGroups();
    } catch (error) {
      console.error('SignalR connection failed', error);
      this.scheduleReconnect();
    } finally {
      this.isStarting = false;
    }
  }

  private async stopConnection(): Promise<void> {
    this.clearReconnectTimer();

    if (!this.connection) {
      return;
    }

    try {
      await this.connection.stop();
    } catch (error) {
      console.error('SignalR stop failed', error);
    } finally {
      this.connection = null;
    }
  }

  private registerConnectionHandlers(connection: HubConnection): void {
    connection.onclose(() => {
      this.scheduleReconnect();
    });

    connection.onreconnected(async () => {
      await this.rejoinProductGroups();
    });

    connection.on('reviews.changed', payload => this.emit(this.reviewsChangedSubject, payload));
    connection.on('user-reviews.changed', payload => this.emit(this.userReviewsChangedSubject, payload));
    connection.on('cart.changed', payload => this.emit(this.cartChangedSubject, payload));
    connection.on('wishlist.changed', payload => this.emit(this.wishlistChangedSubject, payload));
    connection.on('orders.changed', payload => this.emit(this.ordersChangedSubject, payload));
    connection.on('product-inventory.changed', payload => this.emit(this.productInventoryChangedSubject, payload));
    connection.on('admin-dashboard.changed', payload => this.emit(this.adminDashboardChangedSubject, payload));
    connection.on('admin-orders.changed', payload => this.emit(this.adminOrdersChangedSubject, payload));
    connection.on('admin-coupons.changed', payload => this.emit(this.adminCouponsChangedSubject, payload));
    connection.on('admin-users.changed', payload => this.emit(this.adminUsersChangedSubject, payload));
    connection.on('admin-sellers.changed', payload => this.emit(this.adminSellersChangedSubject, payload));
    connection.on('seller-dashboard.changed', payload => this.emit(this.sellerDashboardChangedSubject, payload));
  }

  private async rejoinProductGroups(): Promise<void> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      return;
    }

    for (const productId of this.joinedProductIds) {
      await this.connection.invoke('JoinProductGroup', productId);
    }
  }

  private emit<T>(subject: Subject<T>, payload: T): void {
    this.ngZone.run(() => subject.next(payload));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.syncConnection();
    }, 5000);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}
