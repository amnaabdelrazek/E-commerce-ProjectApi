import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { RouterLink } from '@angular/router';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly productsService = inject(ProductsService);

  readonly state = signal<LoadState>('idle');
  readonly products = signal<Product[]>([]);

  ngOnInit() {
    this.state.set('loading');
    this.productsService.getProducts({ pageNumber: 1, pageSize: 12 }).subscribe({
      next: (res) => {
        this.products.set(res?.data?.data ?? []);
        this.state.set('loaded');
      },
      error: () => this.state.set('error')
    });
  }

  get featured(): Product[] {
    return this.products().slice(0, 4);
  }

  get arrivals(): Product[] {
    return this.products().slice(4, 8);
  }
}

