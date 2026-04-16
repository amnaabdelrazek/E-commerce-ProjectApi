import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart-service';
import { AddToCartResquest } from '../../../core/models/cart';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { TokenStorageService } from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  @Input({ required: true }) product!: Product;
  private readonly cartService = inject(CartService)

  readonly placeholder = '/product-placeholder.svg';

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.placeholder;
  }

  onAddToCart(product: Product)
  {
    
    const token = this.tokenStorage.getToken();
    if (!token) {
      void this.router.navigate(['/login']);
      return;
    }
    const request: AddToCartResquest = {
      productId: this.product.id,
      quantity: 1
    };

   this.cartService.addItem(request).subscribe({
    next: (res) => {
      if (res.isSuccess) {
      
        this.cartService.cartCount.update(count => count + 1);
        alert(res.message);
        console.log("Product"+this.product.name);
      }
    },
    error: (err) => console.error('Error adding to cart', err)
  });
  }
}
