import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../core/models/product.model';

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
  private readonly productsService = inject(ProductsService);

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
}

