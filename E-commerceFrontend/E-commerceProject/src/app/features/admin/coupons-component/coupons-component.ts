import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminService } from '../../../core/services/admin.service';
import { Coupon } from '../../../core/models/coupon';
import { RealtimeService } from '../../../core/services/realtime.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-coupons-component',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './coupons-component.html',
  styleUrl: './coupons-component.css'
})
export class CouponsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly coupons = signal<Coupon[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly activeCouponsCount = computed(() =>
    this.coupons().filter(coupon => this.getCouponStatus(coupon) === 'valid').length
  );

  ngOnInit(): void {
    this.loadCoupons();

    this.realtimeService.adminCouponsChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadCoupons();
      });
  }

  loadCoupons(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getCoupons().subscribe({
      next: (res) => {
        this.coupons.set(Array.isArray(res) ? res : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set("Can't load coupons");
        this.isLoading.set(false);
      }
    });
  }

  onDelete(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.adminService.deleteCoupon(id).subscribe({
        next: () => {
          this.coupons.update(prev => prev.filter(coupon => coupon.id !== id));

          Swal.fire({
            title: 'Deleted!',
            text: 'The coupon has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.fire('Error!', 'Something went wrong on the server.', 'error');
        }
      });
    });
  }

  isExpired(date: string): boolean {
    return new Date(date).getTime() < Date.now();
  }

  getCouponStatus(coupon: Coupon): 'valid' | 'inactive' | 'expired' {
    if (this.isExpired(coupon.expiryDate)) {
      return 'expired';
    }

    return coupon.isActive ? 'valid' : 'inactive';
  }
}
