import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaypalService } from '../../../core/services/paypal.service';
import { CreditCardService } from '../../../core/services/credit-card.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paypalService = inject(PaypalService);
  private creditCardService = inject(CreditCardService);
  private notification = inject(NotificationService);

  orderId: number | null = null;
  isProcessing = false;
  selectedPaymentMethod = signal<'paypal' | 'credit-card'>('credit-card');

  creditCardForm = signal({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });

  ngOnInit(): void {

    const idParam = this.route.snapshot.queryParamMap.get('orderId');

    if (!idParam) {
      this.notification.error('Missing order ID');
      this.router.navigate(['/checkout']);
      return;
    }

    this.orderId = Number(idParam);

    if (isNaN(this.orderId) || this.orderId <= 0) {
      this.notification.error('Invalid order ID');
      this.router.navigate(['/checkout']);
      return;
    }

    console.log('Payment page loaded for order:', this.orderId);
  }

  createPayPalPayment() {
    if (this.isProcessing) {
      console.log('Already processing, skipping duplicate request');
      return;
    }
    
    this.isProcessing = true;
    this.notification.info('Redirecting to PayPal...');
    
    console.log('========== Creating PayPal payment ==========');
    console.log('orderId:', this.orderId);
    console.log('API Base URL:', 'http://localhost:5250/api/PayPal/create');

    this.paypalService.createPayment(this.orderId!).subscribe({
      next: (res) => {
        console.log('========== PayPal API Response ==========');
        console.log('Full response:', res);
        console.log('Response keys:', Object.keys(res));
        console.log('Response.url:', res?.url);

        if (res?.url && res.url.length > 0) {
          console.log('✅ Valid URL found, redirecting to:', res.url);
          window.location.href = res.url;
        } else {
          console.error('❌ No URL in response');
          console.error('Response was:', JSON.stringify(res, null, 2));
          this.notification.error('Invalid PayPal response - no URL returned');
          this.isProcessing = false;
        }

      },
      error: (err) => {
        console.error('========== PayPal API Error ==========');
        console.error('Full error:', err);
        console.error('Error status:', err?.status);
        console.error('Error message:', err?.message);
        console.error('Error.error:', err?.error);
        
        const errorMsg = err?.error?.message || err?.message || 'Failed to start PayPal payment.';
        console.error('Displaying error:', errorMsg);
        this.notification.error(errorMsg);
        this.isProcessing = false;
      }
    });
  }

  validateCardForm(): boolean {
    const form = this.creditCardForm();

    // Remove spaces from card number
    const cardNum = form.cardNumber.replace(/\s/g, '');
    
    if (!cardNum || cardNum.length < 13 || cardNum.length > 19) {
      this.notification.error('Card number must be 13-19 digits');
      return false;
    }

    if (!form.cardHolderName || form.cardHolderName.trim().length < 3) {
      this.notification.error('Card holder name is required');
      return false;
    }

    if (!form.expiryDate || !form.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      this.notification.error('Expiry date must be in MM/YY format');
      return false;
    }

    if (!form.cvv || form.cvv.length < 3 || form.cvv.length > 4) {
      this.notification.error('CVV must be 3-4 digits');
      return false;
    }

    return true;
  }

  processCreditCard() {
    if (this.isProcessing) return;

    if (!this.validateCardForm()) return;

    this.isProcessing = true;
    this.notification.info('Processing credit card payment...');

    const form = this.creditCardForm();

    console.log('========== Processing Credit Card ==========');
    console.log('Order ID:', this.orderId);

    this.creditCardService.processCreditCard({
      orderId: this.orderId!,
      cardNumber: form.cardNumber.replace(/\s/g, ''),
      cardHolderName: form.cardHolderName,
      expiryDate: form.expiryDate,
      cvv: form.cvv
    }).subscribe({
      next: (res) => {
        console.log('========== Credit Card Response ==========');
        console.log('Response:', res);

        if (res.isSuccess) {
          console.log('✅ Payment successful');
          this.notification.success('Payment processed successfully!');
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/success'], {
              queryParams: { orderId: this.orderId }
            });
          }, 2000);
        } else {
          console.error('❌ Payment failed:', res.message);
          this.notification.error(res.message || 'Payment failed');
          this.isProcessing = false;
        }
      },
      error: (err) => {
        console.error('========== Credit Card Error ==========');
        console.error('Error:', err);

        const errorMsg = err?.error?.message || err?.message || 'Failed to process payment';
        this.notification.error(errorMsg);
        this.isProcessing = false;
      }
    });
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.creditCardForm.update(f => ({ ...f, cardNumber: formattedValue }));
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.creditCardForm.update(f => ({ ...f, expiryDate: value }));
  }

  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '').substring(0, 4);
    this.creditCardForm.update(f => ({ ...f, cvv: value }));
  }
}