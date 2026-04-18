import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal, OnInit } from '@angular/core';
import { CartService } from '../../../core/services/cart-service';
import { AddToCartResquest } from '../../../core/models/cart';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly notification = inject(NotificationService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  @Input({ required: true }) product!: Product;

  readonly placeholder = '/product-placeholder.svg';
  readonly isInWishlist = signal(false);
  readonly isFavLoading = signal(false);

  ngOnInit() {
    this.checkIfInWishlist(this.product.id);
  }

  goToProduct() {
    void this.router.navigate(['/products', this.product.id]);
  }

  checkIfInWishlist(productId: number) {
    const token = this.tokenStorage.getToken();
    if (!token) return;

    this.wishlistService.isInWishlist(productId).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.isInWishlist.set(response.data);
        }
      }
    });
  }

  toggleWishlist(product: Product, event: Event) {
    event.stopPropagation();

    const token = this.tokenStorage.getToken();
    if (!token) {
      this.notification.info('Please sign in first to add items to your wishlist.');
      void this.router.navigate(['/login']);
      return;
    }

    this.isFavLoading.set(true);

    if (this.isInWishlist()) {
      // Remove from wishlist
      this.wishlistService.removeFromWishlistByProduct(product.id).subscribe({
        next: () => {
          this.isInWishlist.set(false);
          this.notification.success('Removed from wishlist');
          this.isFavLoading.set(false);
        },
        error: () => {
          this.notification.error('Failed to remove from wishlist');
          this.isFavLoading.set(false);
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: () => {
          this.isInWishlist.set(true);
          this.notification.success('Added to wishlist');
          this.isFavLoading.set(false);
        },
        error: () => {
          this.notification.error('Failed to add to wishlist');
          this.isFavLoading.set(false);
        }
      });
    }
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.placeholder;
  }

  onAddToCart(product: Product) {
    const token = this.tokenStorage.getToken();
    if (!token) {
      this.notification.info('Please sign in first to add products to your cart.');
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
          this.cartService.getCartCount();
          this.notification.success(res.message || `${product.name} added to cart.`);
        }
      },
      error: () => this.notification.error('Could not add this product to the cart.')
    });
  }
}
