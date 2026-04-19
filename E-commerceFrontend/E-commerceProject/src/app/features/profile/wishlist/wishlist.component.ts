import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart-service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddToCartResquest } from '../../../core/models/cart';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatBadgeModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly notification = inject(NotificationService);
  private readonly ngZone = inject(NgZone);

  readonly wishlistItems = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly placeholder = '/product-placeholder.svg';

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    const token = this.tokenStorage.getToken();
    if (!token) {
      void this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.wishlistService.getUserWishlist().subscribe({
      next: (response: any) => {
        if (response.isSuccess && response.data) {
          this.wishlistItems.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load wishlist');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
        const errorMsg = err?.error?.message || err?.message || 'Failed to load wishlist. Please try again.';
        this.error.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    void this.router.navigate(['/profile']);
  }

  removeFromWishlist(itemId: number) {
    this.wishlistService.removeFromWishlist(itemId).subscribe({
      next: () => {
        this.wishlistItems.update(items => items.filter(item => item.id !== itemId));
        this.notification.success('Removed from wishlist');
      },
      error: (err) => {
        console.error('Error removing from wishlist:', err);
        this.error.set('Failed to remove item from wishlist.');
        this.notification.error('Failed to remove item from wishlist');
      }
    });
  }

  getPlaceholder(): string {
    return this.placeholder;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.placeholder;
  }

  addToCart(item: any) {
    const token = this.tokenStorage.getToken();
    if (!token) {
      this.notification.info('Please sign in first to add products to your cart.');
      void this.router.navigate(['/login']);
      return;
    }

    const productId = item.productId;
    const productName = item.productName;

    if (!productId) {
      this.notification.error('Could not add product to cart');
      return;
    }

    const request: AddToCartResquest = {
      productId: productId,
      quantity: 1
    };

    this.cartService.addItem(request).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.cartService.getCartCount();
          this.notification.success(res.message || `${productName} added to cart.`);
        }
      },
      error: () => {
        this.notification.error('Error adding this product to the cart.');
      }
    });
  }
}
