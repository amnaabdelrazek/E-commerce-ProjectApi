import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { OrderService } from '../../../core/services/order-service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatChipsModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly orderService = inject(OrderService);
  private readonly ngZone = inject(NgZone);

  readonly orders = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadUserOrders();
  }

  loadUserOrders() {
    const token = this.tokenStorage.getToken();
    if (!token) {
      void this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.orderService.getUserOrders().subscribe({
      next: (response: any) => {
        if (response.isSuccess && response.data) {
          this.orders.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load orders');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    void this.router.navigate(['/profile']);
  }

  getStatusIcon(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'hourglass_empty',
      'Confirmed': 'check_circle',
      'Completed': 'done_all',
      'Cancelled': 'cancel'
    };
    return statusMap[status] || 'info';
  }

  viewOrderDetails(orderId: number) {
    void this.router.navigate(['/order-details', orderId]);
  }

  cancelOrder(orderId: number) {
    if (confirm('هل تريد بالفعل إلغاء هذا الطلب؟')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.loadUserOrders();
          }
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
        }
      });
    }
  }
}
