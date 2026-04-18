import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly ngZone = inject(NgZone);

  readonly order = signal<any>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(parseInt(orderId, 10));
    }
  }

  loadOrderDetails(orderId: number) {
    this.isLoading.set(true);
    this.error.set(null);

    this.orderService.getOrderById(orderId).subscribe({
      next: (response: any) => {
        if (response.isSuccess && response.data) {
          this.order.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load order details');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading order details:', err);
        this.error.set('Failed to load order details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    void this.router.navigate(['/orders']);
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

  cancelOrder(orderId: number) {
    if (confirm('هل تريد بالفعل إلغاء هذا الطلب؟')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.goBack();
          }
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
        }
      });
    }
  }
}
