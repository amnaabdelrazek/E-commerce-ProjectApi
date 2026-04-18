import { CommonModule } from '@angular/common';
import { Component, inject, signal, NgZone } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart-service';
import { AddToCartResquest } from '../../../core/models/cart';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService)
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly notification = inject(NotificationService);
  private readonly wishlistService = inject(WishlistService);
  private readonly ngZone = inject(NgZone);

  readonly state = signal<LoadState>('loading');
  readonly product = signal<Product | null>(null);
  readonly isInWishlist = signal(false);
  readonly isFavLoading = signal(false);

  readonly placeholder = '/product-placeholder.svg';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.state.set('error');
      return;
    }

    this.productsService.getProductById(id).subscribe({
      next: (res) => {
        this.product.set(res?.data ?? null);
        this.state.set(res?.data ? 'loaded' : 'error');
        
        // Check if product is in wishlist after loading
        if (res?.data) {
          this.checkIfInWishlist(res.data.id);
        }
      },
      error: () => this.state.set('error')
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.placeholder;
  }
  onAddToCart(product: Product)
    {
    const token = this.tokenStorage.getToken();
    if (!token) {
      this.notification.info('Please sign in first to add products to your cart.');
      void this.router.navigate(['/login']);
      return;
    }
      const request: AddToCartResquest = {
        productId: product.id,
        quantity: 1
    };
  
     this.cartService.addItem(request).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.cartService.getCartCount();
          this.notification.success(res.message || `${product.name} added to cart.`);
        }
      },
      error: () => this.notification.error('Error adding this product to the cart.')
    });
    }

  checkIfInWishlist(productId: number) {
    const token = this.tokenStorage.getToken();
    if (!token) {
      return;
    }

    this.wishlistService.isInWishlist(productId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.isInWishlist.set(res.data);
        }
      },
      error: () => this.isInWishlist.set(false)
    });
  }

  toggleWishlist(product: Product) {
    const token = this.tokenStorage.getToken();
    if (!token) {
      this.notification.info('Please sign in first to add products to your wishlist.');
      void this.router.navigate(['/login']);
      return;
    }

    this.isFavLoading.set(true);

    if (this.isInWishlist()) {
      // Remove from wishlist
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.isInWishlist.set(false);
            this.notification.success('Removed from wishlist');
          }
        },
        error: () => {
          this.notification.error('Error updating wishlist');
          this.ngZone.run(() => {
            this.isFavLoading.set(false);
          });
        },
        complete: () => {
          this.ngZone.run(() => {
            this.isFavLoading.set(false);
          });
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.isInWishlist.set(true);
            this.notification.success(res.message || 'Added to wishlist!');
          }
        },
        error: () => {
          this.notification.error('Error adding to wishlist');
          this.ngZone.run(() => {
            this.isFavLoading.set(false);
          });
        },
        complete: () => {
          this.ngZone.run(() => {
            this.isFavLoading.set(false);
          });
        }
      });
    }
  }
}

