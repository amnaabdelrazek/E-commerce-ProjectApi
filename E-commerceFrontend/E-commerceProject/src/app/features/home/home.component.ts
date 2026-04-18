import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { RouterLink } from '@angular/router';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);

  readonly state = signal<LoadState>('idle');
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  ngOnInit() {
    this.state.set('loading');
    this.categoriesService.getCategories(1, 6).subscribe({
      next: (res) => this.categories.set(res?.data?.data ?? [])
    });
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

