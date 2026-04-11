import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './category-products.component.html',
  styleUrl: './category-products.component.css'
})
export class CategoryProductsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);

  readonly title = this.route.snapshot.data['title'] ?? 'Category';
  readonly categoryName = String(this.route.snapshot.data['categoryName'] ?? '').trim();

  readonly state = signal<LoadState>('idle');
  readonly all = signal<Product[]>([]);

  readonly pageNumber = signal(1);
  readonly pageSize = signal(12);

  readonly form = this.fb.nonNullable.group({
    name: ['']
  });

  readonly filtered = computed(() => {
    const term = (this.form.controls.name.value ?? '').trim().toLowerCase();
    const cat = this.categoryName.toLowerCase();

    return this.all().filter((p) => {
      const matchesCategory = !cat || (p.categoryName ?? '').toLowerCase() === cat;
      if (!matchesCategory) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term)
      );
    });
  });

  readonly pageItems = computed(() => {
    const start = (this.pageNumber() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  readonly totalCount = computed(() => this.filtered().length);

  ngOnInit() {
    this.load();
  }

  load() {
    this.state.set('loading');
    this.productsService.getProducts({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => {
        this.all.set(res?.data?.data ?? []);
        this.pageNumber.set(1);
        this.state.set('loaded');
      },
      error: () => this.state.set('error')
    });
  }

  apply() {
    this.pageNumber.set(1);
  }

  clear() {
    this.form.reset({ name: '' });
    this.pageNumber.set(1);
  }

  next() {
    const maxPage = Math.max(1, Math.ceil(this.totalCount() / this.pageSize()));
    if (this.pageNumber() >= maxPage) return;
    this.pageNumber.set(this.pageNumber() + 1);
  }

  prev() {
    if (this.pageNumber() <= 1) return;
    this.pageNumber.set(this.pageNumber() - 1);
  }
}

