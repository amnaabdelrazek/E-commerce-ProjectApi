import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart-service';
import { AddToCartResquest } from '../../../core/models/cart';
import { TokenStorageService } from '../../../core/services/token-storage.service';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService)
  private readonly tokenStorage = inject(TokenStorageService);

  readonly state = signal<LoadState>('loading');
  readonly product = signal<Product | null>(null);

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
        
          this.cartService.cartCount.update(count => count + 1);
          alert(res.message);
          console.log("Product"+this.product.name);
        }
      },
      error: (err) => console.error('Error adding to cart', err)
    });
    }
}

