import { CartService } from './../../core/services/cart-service';
import { CheckoutRequest, OrderSummary } from './../../core/models/order-summary';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from './../../core/services/order-service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout-cpmponent',
  imports: [CurrencyPipe],
  templateUrl: './checkout-cpmponent.html',
  styleUrl: './checkout-cpmponent.css',
})
export class CheckoutCpmponent implements OnInit{
  private route = inject(ActivatedRoute);
  private OrderService = inject(OrderService);
  private authService = inject(AuthService);
  private cartService = inject(CartService)
  summary = signal<OrderSummary | null>(null);
  checkoutForm = signal<CheckoutRequest>({
  email: '', firstName: '', lastName: '', address: '',
  city: '', state: 'Confirmed', postalCode: '00000', country: 'Egypt',
  phoneNumber: '', paymentMethod: 'PayPal', 
  promoCode: '', sessionId: '', orderNotes: ''
});

ngOnInit(): void {
  // 1. استلام البرومو من اللينك
  const promoFromUrl = this.route.snapshot.queryParamMap.get('promo');
  if (promoFromUrl) {
    this.checkoutForm.update(prev => ({ ...prev, promoCode: promoFromUrl }));
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
  const cartId = 1; 
  const promo = this.checkoutForm().promoCode || '';

  
  this.OrderService.getOrderSummary(cartId, promo).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.summary.set(res.data);
      }
    },
    error: (err) => {
      console.error('Error fetching summary:', err);
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

  confirmOrder() {
    this.OrderService.placeOrder(this.checkoutForm()).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          alert('Order Placed Successfully!');
          
        }
      },
      error: (err) => console.error('Order failed', err)
    });
  }

updateFirstName(event: any) {
  this.checkoutForm.update(prev => ({ ...prev, firstName: event.target.value }));
}

updateLastName(event: any) {
  this.checkoutForm.update(prev => ({ ...prev, lastName: event.target.value }));
}

  placeOrder() {
  if (!this.checkoutForm().address || !this.checkoutForm().phoneNumber) {
    alert('Please fill in your shipping details');
    return;
  }

  this.OrderService.placeOrder(this.checkoutForm()).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        alert('Order placed successfully!');
        this.cartService.clearCart();
        
      }
    },
    error: (err) => console.error('Checkout failed', err)
  });
}
}

