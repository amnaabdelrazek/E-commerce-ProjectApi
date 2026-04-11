import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);

  readonly state = signal<LoadState>('idle');
  readonly products = signal<Product[]>([]);
  readonly totalCount = signal(0);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(12);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    minPrice: [''],
    maxPrice: ['']
  });

  ngOnInit() {
    this.load();
  }

  load(page = 1) {
    this.pageNumber.set(page);
    this.state.set('loading');

    const { name, minPrice, maxPrice } = this.form.getRawValue();

    this.productsService
      .getProducts({
        name: name || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize()
      })
      .subscribe({
        next: (res) => {
          const paged = res?.data;
          this.products.set(paged?.data ?? []);
          this.totalCount.set(paged?.totalCount ?? 0);
          this.state.set('loaded');
        },
        error: () => this.state.set('error')
      });
  }

  apply() {
    this.load(1);
  }

  clear() {
    this.form.reset({ name: '', minPrice: '', maxPrice: '' });
    this.load(1);
  }

  next() {
    const maxPage = Math.max(1, Math.ceil(this.totalCount() / this.pageSize()));
    if (this.pageNumber() >= maxPage) return;
    this.load(this.pageNumber() + 1);
  }

  prev() {
    if (this.pageNumber() <= 1) return;
    this.load(this.pageNumber() - 1);
  }
}

