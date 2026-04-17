import { Component, inject, signal } from '@angular/core';
import { Cart, PromoCodeRequest } from '../../core/models/cart';
import { CartService } from '../../core/services/cart-service';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-cart-component',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart-component.html',
  styleUrl: './cart-component.css',
})
export class CartComponent {
  constructor(private router: Router, private sendcartService: CartService) {}
  private readonly cartService = inject(CartService);
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
        this.isLoading.set(false); 
      }
    })
  }

removeItem(productId: number) {
  this.cartService.removeCartItem(productId).subscribe({
    next: (res) => {
      if (res.isSuccess) {
       
        this.loadCart();
        
       
        this.cartService.cartCount.update(count => Math.max(0, count - 1));
        
        console.log('Deleted');
      }
    },
    error: (err) => console.error('error in deleting', err)
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
          console.log('Discount Applied:', discount);
          //this.loadCart(); 
        } else {
          this.promoError.set(res.message);
          this.discountedTotal.set(null);
        }
      },
      error: () => {
      this.isApplyingPromo.set(false);
      this.promoError.set('Invalid promo code');
      this.discountedTotal.set(null);
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
   
    const appliedPromo = this.promoCode().trim();

   
    this.router.navigate(['/checkout'], { 
      queryParams: { promo: appliedPromo || null} 
    });
  }
}
