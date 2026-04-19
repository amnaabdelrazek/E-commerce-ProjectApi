import { CartService } from './../../core/services/cart-service';
import { CheckoutRequest, OrderSummary } from './../../core/models/order-summary';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from './../../core/services/order-service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-checkout-cpmponent',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout-cpmponent.html',
  styleUrl: './checkout-cpmponent.css',
})
export class CheckoutCpmponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  summary = signal<OrderSummary | null>(null);
  isProcessing = signal<boolean>(false);

  checkoutForm = signal<CheckoutRequest>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: 'Confirmed',
    postalCode: '00000',
    country: 'Egypt',
    phoneNumber: '',
    paymentMethod: 'PayPal',
    promoCode: '',
    sessionId: '',
    orderNotes: ''
  });

  ngOnInit(): void {

    const promoFromUrl = this.route.snapshot.queryParamMap.get('promo');
    if (promoFromUrl) {
      this.checkoutForm.update(p => ({ ...p, promoCode: promoFromUrl }));
    }

    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.checkoutForm.update(prev => ({
            ...prev,
            firstName: res.data.firstName || res.data.fullName?.split(' ')[0] || '',
            lastName: res.data.lastName || res.data.fullName?.split(' ').slice(1).join(' ') || '',
            email: res.data.email || ''
          }));
        }
      }
    });

    // Get cart first to obtain the cart ID before loading summary
    this.cartService.getCartItems().subscribe({
      next: (cartRes) => {
        if (cartRes.isSuccess && cartRes.data?.id) {
          console.log('Cart loaded with ID:', cartRes.data.id);
          this.cartService.setCartId(cartRes.data.id);
          this.loadSummary();
        } else {
          console.error('Failed to load cart or cart is empty');
          this.notification.error('Cart is empty or could not be loaded.');
        }
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.notification.error('Failed to load your cart.');
      }
    });
  }

  loadSummary() {
    const cartId = this.cartService.getCartId();
    const promo = this.checkoutForm().promoCode || '';

    console.log('loadSummary called with cartId:', cartId, 'promo:', promo);

    if (!cartId || cartId <= 0) {
      console.error('Invalid cartId:', cartId);
      this.notification.error('Invalid cart ID. Please refresh your cart.');
      return;
    }

    this.orderService.getOrderSummary(cartId, promo).subscribe({
      next: (res) => {
        console.log('getOrderSummary response:', res);
        if (res.isSuccess) {
          this.summary.set(res.data);
        } else {
          console.error('API returned error:', res);
          this.notification.error(res.message || 'Could not load checkout summary.');
        }
      },
      error: (err) => {
        console.error('getOrderSummary error:', err);
        const errorMsg = err?.error?.message || err?.message || 'Could not load checkout summary.';
        this.notification.error(errorMsg);
      }
    });
  }

  updateField(field: keyof CheckoutRequest, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.checkoutForm.update(prev => ({
      ...prev,
      [field]: value
    }));
  }

  updateFirstName(event: any) {
    this.checkoutForm.update(p => ({ ...p, firstName: event.target.value }));
  }

  updateLastName(event: any) {
    this.checkoutForm.update(p => ({ ...p, lastName: event.target.value }));
  }

  confirmOrder() {
    this.placeOrder();
  }

  placeOrder() {
    // Prevent duplicate submissions
    if (this.isProcessing()) {
      console.log('Already processing, skipping duplicate request');
      return;
    }

    const form = this.checkoutForm();

    if (!form.address || !form.phoneNumber) {
      this.notification.error('Please fill in your shipping details.');
      return;
    }

    // Set processing state
    this.isProcessing.set(true);
    this.notification.info('Processing your order...');

    console.log('========== Placing Order ==========');
    console.log('Shipping Address:', form.address);
    console.log('Payment Method:', form.paymentMethod);

    this.orderService.placeOrder(form).subscribe({
      next: (res) => {
        console.log('Order response:', res);

        if (!res.isSuccess) {
          console.error('Order failed:', res.message);
          this.notification.error('Order failed: ' + (res.message || 'Unknown error'));
          this.isProcessing.set(false);
          return;
        }

        const orderId =
          typeof res.data === 'object'
            ? res.data.id  // Changed from orderId to id
            : res.data;

        console.log('✅ Order created with ID:', orderId);

        // ================= PAYPAL FLOW =================
        if (form.paymentMethod === 'PayPal') {
          console.log('Redirecting to PayPal payment...');
          this.notification.success('Order created! Redirecting to payment...');
          
          setTimeout(() => {
            this.router.navigate(['/payment'], {
              queryParams: { orderId: orderId }
            });
          }, 1000);

        } else {
          console.log('Credit card or other payment method selected');
          console.log('Redirecting to payment page...');
          this.notification.success('Order created! Redirecting to payment...');
          
          setTimeout(() => {
            this.router.navigate(['/payment'], {
              queryParams: { orderId: orderId }
            });
          }, 1000);
        }
      },
      error: (err) => {
        console.error('========== Checkout Error ==========');
        console.error('Error:', err);
        const errorMsg = err?.error?.message || err?.message || 'Checkout failed. Please try again.';
        this.notification.error(errorMsg);
        this.isProcessing.set(false);
      }
    });
  }
}