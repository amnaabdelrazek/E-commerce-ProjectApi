import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, GeneralResponse, Order } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-admin.component.html',
  styleUrls: [
    './orders-admin.component.css',
    '../tables/tables-animations.css'
  ]
})
export class OrdersAdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessage = '';
  hasLoadedOnce = false;

  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadOrders();
  }

 loadOrders(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.adminService.getOrders().subscribe({
    next: (res: Order[]) => {
      // ✅ API returns plain array
      this.orders = Array.isArray(res) ? res : [];

      this.errorMessage = '';
      this.isLoading = false;
      this.hasLoadedOnce = true;

      this.cdr.detectChanges();
    },

    error: (err: any) => {
      console.error('Error loading orders:', err);

      const status = err?.status || 'Unknown';
      const message =
        err?.error?.message ||
        err?.message ||
        'Failed to load orders. Please try again.';

      this.errorMessage = `Failed to load orders (${status}): ${message}`;
      this.orders = [];

      this.notificationService.error(this.errorMessage);

      this.isLoading = false;
      this.hasLoadedOnce = true;

      this.cdr.detectChanges();
    }
  });
}

  // ✅ FIXED: proper Angular-safe event handling
  onStatusChange(orderId: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;

    this.adminService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        setTimeout(() => this.notificationService.success('Order status updated'), 0);
        this.loadOrders();
      },
      error: () => {
        setTimeout(() => this.notificationService.error('Failed to update order status'), 0);
      }
    });
  }

  next(): void {
    this.page++;
  }

  prev(): void {
    if (this.page > 1) {
      this.page--;
    }
  }
search(val: string): void {
  this.searchTerm = val.trim();
  this.page = 1;
}
  // ✅ Filter orders by search term
  get filteredOrders(): Order[] {
    if (!this.searchTerm.trim()) {
      return this.orders;
    }

    return this.orders.filter(order =>
      order.id.toString().includes(this.searchTerm) ||
      order.userId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // ✅ Paginate filtered results
  get paginatedOrders(): Order[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
  }

  // ✅ Format date
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  // ✅ Get order summary
  getOrderSummary(order: Order): string {
    const itemCount = order.items?.length || 0;
    return `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
  }

  // ✅ TrackBy function for ngFor
  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }
}
