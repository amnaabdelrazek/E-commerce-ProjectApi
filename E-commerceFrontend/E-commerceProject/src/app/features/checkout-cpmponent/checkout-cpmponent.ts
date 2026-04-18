import { CartService } from './../../core/services/cart-service';
import { CheckoutRequest, OrderSummary } from './../../core/models/order-summary';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from './../../core/services/order-service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-checkout-cpmponent',
  imports: [CurrencyPipe, RouterLink],
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

    this.loadSummary();
  }

  loadSummary() {
    const cartId = this.cartService.getCartId();
    const promo = this.checkoutForm().promoCode || '';

    this.orderService.getOrderSummary(cartId, promo).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.summary.set(res.data);
        }
      },
      error: () => {
        this.notification.error('Could not load checkout summary.');
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
    this.notification.info('Review your details, then complete checkout.');
  }

  placeOrder() {

    const form = this.checkoutForm();

    if (!form.address || !form.phoneNumber) {
      this.notification.error('Please fill in your shipping details.');
      return;
    }

    this.orderService.placeOrder(form).subscribe({
      next: (res) => {

        if (!res.isSuccess) {
          this.notification.error('Order failed');
          return;
        }

        const orderId =
          typeof res.data === 'object'
            ? res.data.orderId
            : res.data;

        // ================= PAYPAL FLOW =================
        if (form.paymentMethod === 'PayPal') {

          this.router.navigate(['/payment'], {
            queryParams: { orderId: orderId }
          });

        } else {

          this.notification.success('Order placed successfully!');
          this.cartService.clearCart();
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.notification.error('Checkout failed. Please try again.');
      }
    });
  }
}