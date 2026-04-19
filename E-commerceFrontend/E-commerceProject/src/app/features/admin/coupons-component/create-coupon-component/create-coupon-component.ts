import { NotificationService } from './../../../../core/services/notification.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../../core/services/admin.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-coupon-component',
  imports: [FormsModule],
  templateUrl: './create-coupon-component.html',
  styleUrl: './create-coupon-component.css',
})
export class CreateCouponComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  code = signal('');
  discount = signal<number | null>(null);
  minAmount = signal<number>(0);
  expiryDate = signal('');
  isLoading = signal(false);
  isPercentage = signal<boolean>(true);

  ngOnInit(): void {
    this.code.set('');
    this.isLoading.set(false);
  }
  onSubmit() {
    if (!this.code()) {
      this.notificationService.error('Coupon code is required!');
      return;
    }
    if (!this.discount() || this.discount()! <= 0) {
      this.notificationService.error('Please enter a valid discount value!');
      return;
    }
    if (!this.expiryDate()) {
      this.notificationService.error('Expiry date is required!');
      return;
    }
    this.isLoading.set(true);
    const dto = {
      code: this.code(),
      minimumPurchaseAmount: this.minAmount(),
      expiryDate: this.expiryDate(),
      discountPercentage: this.isPercentage() ? this.discount() : null,
      discountAmount: !this.isPercentage() ? this.discount() : 0
    };

    this.adminService.createCoupon(dto).subscribe({
      next: (res) => {
        // بيدخل هنا لو الـ Status Code 200 (Success)
        setTimeout(() => {
          this.notificationService.success('Coupon created successfully!');
          this.router.navigate(['admin/coupons']);
        }, 100);
      },
error: (err) => {
    this.isLoading.set(false);

    let errorMessage = 'حدث خطأ غير متوقع'; // الرسالة الافتراضية

    console.log('Full Error Object:', err); // بصي في الكونسول عشان تشوفي شكل الـ Object اللي راجع

    if (err.error) {
        // 1. لو الباك بيبعت String صريح
        if (typeof err.error === 'string') {
            errorMessage = err.error;
        } 
        // 2. لو الباك بيبعت Object فيه property اسمها message أو error
        else if (err.error.message) {
            errorMessage = err.error.message;
        } 
        else if (err.error.error) {
            errorMessage = err.error.error;
        }
        // 3. لو دي Validation Errors بتاعة الـ Model State (زي اللي ASP.NET بيبعتها)
        else if (err.error.errors) {
            const validationErrors = Object.values(err.error.errors).flat();
            errorMessage = validationErrors[0] as string; // خدي أول رسالة خطأ واضحة
        }
    } else {
        errorMessage = err.message || errorMessage;
    }

    setTimeout(() => {
        this.notificationService.error(errorMessage);
    }, 50);
}
    });
  }

  goBack() {
    this.router.navigate(['/admin/coupons']);
  }
}
