import { CommonModule } from '@angular/common';
import { Component, inject, signal, NgZone } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly ngZone = inject(NgZone);

  readonly state = signal<LoadState>('idle');
  readonly products = signal<Product[]>([]);
  readonly totalCount = signal(0);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(12);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedCategoryName = signal('');
  readonly categories = signal<Category[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    minPrice: [''],
    maxPrice: ['']
  });

  ngOnInit() {
    this.categoriesService.getCategories(1, 50).subscribe({
      next: (res) => {
        const categories = res?.data?.data ?? [];
        this.categories.set(categories);
        const currentId = this.selectedCategoryId();
        if (currentId) {
          this.selectedCategoryName.set(categories.find((c) => c.id === currentId)?.name ?? '');
        }
      }
    });

    this.route.queryParamMap.subscribe((params) => {
      const rawCategoryId = Number(params.get('categoryId'));
      this.selectedCategoryId.set(Number.isFinite(rawCategoryId) && rawCategoryId > 0 ? rawCategoryId : null);
      const name = params.get('name') ?? '';
      const minPrice = params.get('minPrice') ?? '';
      const maxPrice = params.get('maxPrice') ?? '';
      this.form.patchValue({ name, minPrice, maxPrice }, { emitEvent: false });
      const categoryName = this.categories().find((c) => c.id === this.selectedCategoryId())?.name ?? '';
      this.selectedCategoryName.set(categoryName);
      this.load(1);
    });
  }

  load(page = 1) {
    this.pageNumber.set(page);
    this.state.set('loading');

    const { name, minPrice, maxPrice } = this.form.getRawValue();

    this.productsService
      .getProducts({
        name: name || undefined,
        categoryId: this.selectedCategoryId() ?? undefined,
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
        error: () => {
          this.state.set('error');
        }
      });
  }

  apply() {
    const { name, minPrice, maxPrice } = this.form.getRawValue();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        name: name || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        categoryId: this.selectedCategoryId() ?? null
      }
    });
  }

  clear() {
    this.form.reset({ name: '', minPrice: '', maxPrice: '' });
    this.selectedCategoryId.set(null);
    this.selectedCategoryName.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoryId: null, name: null, minPrice: null, maxPrice: null }
    });
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

