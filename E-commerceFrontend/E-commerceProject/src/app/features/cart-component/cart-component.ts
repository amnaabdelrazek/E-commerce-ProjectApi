import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Cart, PromoCodeRequest } from '../../core/models/cart';
import { CartService } from '../../core/services/cart-service';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-cart-component',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart-component.html',
  styleUrl: './cart-component.css',
})
export class CartComponent {
  constructor(private router: Router, private sendcartService: CartService) {}
  private readonly cartService = inject(CartService);
  private readonly notification = inject(NotificationService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  cartData = signal<Cart | null>(null);
  isLoading = signal(true);
  promoCode = signal('');
  discountedTotal = signal<number | null>(null);
  promoError = signal<string | null>(null);
  isApplyingPromo = signal(false);
  // shippingInfo = signal({
  //   firstName: '',
  //   lastName: '',
  //   address: '',
  //   city: '',
  //   state: '',
  //   postalCode: '',
  //   phoneNumber: ''
  // })
  ngOnInit(): void {
    this.loadCart();

    this.realtimeService.cartChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadCart();
      });
  }

  loadCart(): void{
    this.cartService.getCartItems().subscribe({
      next: (res) => {
        if(res.isSuccess){
          this.cartData.set(res.data);
          this.cartService.cartCount.set(res.data.items.length);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.notification.error('Could not load your cart right now.');
        this.isLoading.set(false); 
      }
    })
  }

removeItem(productId: number) {
  this.cartService.removeCartItem(productId).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.loadCart();
        this.cartService.getCartCount();
        this.notification.success(res.message || 'Item removed from your cart.');
      }
    },
    error: () => this.notification.error('Could not remove this item.')
  });
}

applyPromo(): void{
  const code = this.promoCode().trim();
  const currentSubtotal = this.cartData()?.subTotal || 0;

if (!code) return;

  this.isApplyingPromo.set(true); 
  this.promoError.set(null);

  const request: PromoCodeRequest = {
    promoCode: code,
    subtotal: currentSubtotal
  };
  
  this.cartService.applyPromoCode(request).subscribe({
    next: (res) => {
      this.isApplyingPromo.set(false);
      if (res.isSuccess && res.data) {
          const discount = res.data.discountAmount;
          this.discountedTotal.set(currentSubtotal - discount);
          this.promoError.set(null);
          this.notification.success('Promo code applied successfully.');
        } else {
          this.promoError.set(res.message);
          this.discountedTotal.set(null);
          this.notification.error(res.message || 'Promo code is invalid.');
        }
      },
      error: () => {
      this.isApplyingPromo.set(false);
      this.promoError.set('Invalid promo code');
      this.discountedTotal.set(null);
      this.notification.error('Invalid promo code.');
    }
  })
} 

onCheckout(): void{
  const currentCart = this.cartData();
  if(!currentCart)
    return;

  const orderBody = {

  }
}

goToCheckout() {
    if (!this.cartData()?.items?.length) {
      this.notification.info('Your cart is empty.');
      return;
    }
   
    const appliedPromo = this.promoCode().trim();

   
    this.router.navigate(['/checkout'], { 
      queryParams: { promo: appliedPromo || null} 
    });
  }
}
