import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaypalService } from '../../../core/services/paypal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div style="text-align: center;">
        <h2>{{ isProcessing ? 'Processing payment...' : 'Payment Result' }}</h2>
        <p *ngIf="isProcessing">Please wait while we process your payment</p>
        <p *ngIf="!isProcessing && errorMessage" style="color: red;">{{ errorMessage }}</p>
        <p *ngIf="!isProcessing && !errorMessage" style="color: green; font-size: 18px;">✅ Payment successful!</p>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentSuccessComponent implements OnInit {
  isProcessing = true;
  errorMessage = '';
  paymentMethod: 'paypal' | 'credit-card' = 'credit-card';

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private paypal: PaypalService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const paymentId = this.route.snapshot.queryParamMap.get('paymentId');
    const payerId = this.route.snapshot.queryParamMap.get('PayerID') || this.route.snapshot.queryParamMap.get('payerId');
    const orderId = this.route.snapshot.queryParamMap.get('orderId');

    console.log('========== Payment Success Page ==========');
    console.log('Payment ID:', paymentId);
    console.log('Payer ID:', payerId);
    console.log('Order ID:', orderId);

    // Check if this is a PayPal payment (has paymentId) or Credit Card (has only orderId)
    if (paymentId && payerId) {
      console.log('💳 Detected: PayPal Payment');
      this.paymentMethod = 'paypal';
      this.executePayPalPayment(paymentId, payerId);
    } else if (orderId) {
      console.log('💳 Detected: Credit Card Payment - Already processed');
      this.paymentMethod = 'credit-card';
      this.handleCreditCardSuccess(orderId);
    } else {
      console.error('❌ Missing payment parameters');
      this.isProcessing = false;
      this.errorMessage = 'Invalid payment parameters';
      this.notification.error('Invalid payment parameters');
    }
  }

  private executePayPalPayment(paymentId: string, payerId: string): void {
    this.paypal.executePayment(paymentId, payerId)
      .subscribe({
        next: (res) => {
          console.log('✅ PayPal payment executed successfully:', res);
          this.isProcessing = false;
          this.notification.success('Payment successful ✅');
          
          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        },
        error: (err) => {
          console.error('❌ PayPal payment execution failed:', err);
          this.isProcessing = false;
          this.errorMessage = err?.error?.message || 'Payment failed. Please try again.';
          this.notification.error(this.errorMessage);
        }
      });
  }

  private handleCreditCardSuccess(orderId: string): void {
    console.log('✅ Credit card payment already processed for order:', orderId);
    this.isProcessing = false;
    this.notification.success('Payment successful ✅');
    
    setTimeout(() => {
      this.router.navigate(['/orders']);
    }, 2000);
  }
}