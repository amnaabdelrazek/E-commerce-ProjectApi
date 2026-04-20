import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AdminProduct,
  AdminService,
  CreateProductDto,
  UpdateProductDto
} from '../../../core/services/admin.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/category.model';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize, retry } from 'rxjs/operators';
import { RealtimeService } from '../../../core/services/realtime.service';

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  private adminService = inject(AdminService);
  private categoriesService = inject(CategoriesService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  products: AdminProduct[] = [];
  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  isModalOpen = false;
  isDeleteModalOpen = false;
  isImageUploadModalOpen = false;
  modalMode: ModalMode = 'create';
  editingProductId: number | null = null;
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  searchTerm = '';
  selectedCategoryId = 0;
  stockFilter: 'all' | 'in' | 'out' = 'all';
  minPriceFilter: number | null = null;
  maxPriceFilter: number | null = null;
  errorMessage = '';
  hasLoadedOnce = false;
  currentImagePreview: string | null = null;
  selectedImageFile: File | null = null;
  imageHint = '';
  pendingDeleteProduct: AdminProduct | null = null;
  pendingProductId: number | null = null;
  pendingProductName = '';
  pendingUploadPreview: string | null = null;
  pendingUploadFile: File | null = null;
  private currentLoadId = 0;

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    categoryId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.realtimeService.productInventoryChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        let hasMatchingProduct = false;

        this.products = this.products.map((product) => {
          if (product.id !== event.productId) {
            return product;
          }

          hasMatchingProduct = true;
          return {
            ...product,
            stockQuantity: event.stockQuantity
          };
        });

        if (hasMatchingProduct) {
          this.cdr.detectChanges();
        }
      });

    this.loadCategories();
    setTimeout(() => this.loadProducts(), 0);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingProductId = null;
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: 0
    });
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
    this.isModalOpen = true;
  }

  openEditModal(product: AdminProduct): void {
    const matchedCategory = this.categories.find(category => category.name === product.categoryName);

    this.modalMode = 'edit';
    this.editingProductId = product.id;
    this.productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: matchedCategory?.id ?? 0
    });
    this.currentImagePreview = product.imageUrl;
    this.selectedImageFile = null;
    this.imageHint = 'Choose a new image to replace the current product image.';
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isModalOpen = false;
    this.editingProductId = null;
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
  }

  closeImageUploadModal(forceReload = true): void {
    if (this.isSubmitting && forceReload) {
      return;
    }

    this.isImageUploadModalOpen = false;
    this.pendingProductId = null;
    this.pendingProductName = '';
    this.pendingUploadPreview = null;
    this.pendingUploadFile = null;

    if (forceReload) {
      this.loadProducts();
    }
  }

  openDeleteModal(product: AdminProduct): void {
    this.pendingDeleteProduct = product;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(force = false): void {
    if (this.isSubmitting && !force) {
      return;
    }

    this.isDeleteModalOpen = false;
    this.pendingDeleteProduct = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImageFile = file;

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.currentImagePreview = typeof reader.result === 'string' ? reader.result : this.currentImagePreview;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  onPendingImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.pendingUploadFile = file;

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.pendingUploadPreview = typeof reader.result === 'string' ? reader.result : this.pendingUploadPreview;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  submitSearch(term: string): void {
    this.searchTerm = term.trim();
    this.pageNumber = 1;
    this.loadProducts();
  }

  applyCategoryFilter(categoryId: number | string): void {
    this.selectedCategoryId = Number(categoryId) || 0;
    this.pageNumber = 1;
    this.loadProducts();
  }

  applyStockFilter(filter: 'all' | 'in' | 'out'): void {
    this.stockFilter = filter;
    this.pageNumber = 1;
    this.loadProducts();
  }

  applyPriceFilters(minPrice: string | number, maxPrice: string | number): void {
    this.minPriceFilter = minPrice === '' ? null : Number(minPrice);
    this.maxPriceFilter = maxPrice === '' ? null : Number(maxPrice);
    this.pageNumber = 1;
    this.loadProducts();
  }

  retryLoadProducts(): void {
    this.loadProducts();
  }

  clearSearch(searchInput: HTMLInputElement): void {
    searchInput.value = '';
    this.searchTerm = '';
    this.selectedCategoryId = 0;
    this.stockFilter = 'all';
    this.minPriceFilter = null;
    this.maxPriceFilter = null;
    this.pageNumber = 1;
    this.loadProducts();
  }

  clearSingleFilter(filter: 'category' | 'stock' | 'minPrice' | 'maxPrice'): void {
    if (filter === 'category') this.selectedCategoryId = 0;
    if (filter === 'stock') this.stockFilter = 'all';
    if (filter === 'minPrice') this.minPriceFilter = null;
    if (filter === 'maxPrice') this.maxPriceFilter = null;
    this.pageNumber = 1;
    this.loadProducts();
  }

  get selectedCategoryName(): string {
    return this.categories.find(category => category.id === this.selectedCategoryId)?.name ?? '';
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) {
      return;
    }

    this.pageNumber = page;
    this.loadProducts();
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload = this.productForm.getRawValue();
    this.isSubmitting = true;

    const request$ = this.modalMode === 'edit' && this.editingProductId !== null
      ? this.adminService.updateProduct(this.editingProductId, payload as UpdateProductDto)
      : this.adminService.createProduct(payload as CreateProductDto);

    request$.subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Could not save product.');
          return;
        }

        this.notificationService.success(
          this.modalMode === 'edit' ? 'Product updated successfully.' : 'Product created successfully.'
        );

        if (this.modalMode === 'edit' && this.editingProductId !== null && this.selectedImageFile) {
          this.uploadImageForExistingProduct(this.editingProductId);
          return;
        }

        if (this.modalMode === 'create') {
          this.prepareImageUploadStep(payload.name, payload.description);
          return;
        }

        this.finishSaveFlow();
      },
      error: () => {
        this.notificationService.error(
          this.modalMode === 'edit' ? 'Failed to update product.' : 'Failed to create product.'
        );
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  deleteProduct(product: AdminProduct): void {
    this.openDeleteModal(product);
  }

  confirmDeleteProduct(): void {
    if (!this.pendingDeleteProduct) {
      return;
    }

    const product = this.pendingDeleteProduct;
    this.isSubmitting = true;

    this.adminService.deleteProduct(product.id).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Could not delete product.');
          return;
        }

        this.notificationService.success('Product deleted successfully.');

        if (this.products.length === 1 && this.pageNumber > 1) {
          this.pageNumber -= 1;
        }

        this.closeDeleteModal(true);
        this.loadProducts();
      },
      error: () => {
        this.notificationService.error('Failed to delete product.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  trackByProductId(_: number, product: AdminProduct): number {
    return product.id;
  }

  submitPendingImageUpload(): void {
    if (!this.pendingProductId) {
      this.notificationService.error('Could not detect the created product.');
      return;
    }

    if (!this.pendingUploadFile) {
      this.notificationService.error('Please choose an image first.');
      return;
    }

    this.isSubmitting = true;

    this.adminService.uploadProductImage(this.pendingProductId, this.pendingUploadFile).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Product image upload failed.');
          return;
        }

        this.notificationService.success('Product image uploaded successfully.');
        this.isImageUploadModalOpen = false;
        this.pendingProductId = null;
        this.pendingProductName = '';
        this.pendingUploadPreview = null;
        this.pendingUploadFile = null;
        this.loadProducts();
      },
      error: () => {
        this.notificationService.error('Failed to upload product image.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private loadProducts(): void {
    const loadId = ++this.currentLoadId;
    this.isLoading = true;
    this.errorMessage = '';

    const minPrice = this.minPriceFilter ?? undefined;
    const maxPrice = this.maxPriceFilter ?? undefined;

    this.adminService.getProducts(
      this.pageNumber,
      this.pageSize,
      this.searchTerm,
      this.selectedCategoryId || undefined,
      minPrice,
      maxPrice
    ).pipe(
      retry({ count: 1, delay: 300 }),
      finalize(() => {
        if (loadId === this.currentLoadId) {
          this.isLoading = false;
          this.hasLoadedOnce = true;
          this.cdr.detectChanges();
        }
      })
    ).subscribe({
      next: (response) => {
        if (loadId !== this.currentLoadId) {
          return;
        }

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'Could not load products.';
          this.products = [];
          this.totalCount = 0;
          this.notificationService.error(this.errorMessage);
          this.cdr.detectChanges();
          return;
        }

        let products = response.data.data;

        if (this.stockFilter === 'in') {
          products = products.filter(product => product.stockQuantity > 0);
        }

        if (this.stockFilter === 'out') {
          products = products.filter(product => product.stockQuantity <= 0);
        }

        this.products = products;
        this.totalCount = response.data.totalCount ?? this.products.length;
        this.pageNumber = response.data.pageNumber ?? this.pageNumber;
        this.pageSize = response.data.pageSize ?? this.pageSize;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: () => {
        if (loadId !== this.currentLoadId) {
          return;
        }

        this.products = [];
        this.totalCount = 0;
        this.errorMessage = 'Failed to load products. Please try again.';
        this.notificationService.error(this.errorMessage);
        this.cdr.detectChanges();
      }
    });
  }

  private uploadImageForExistingProduct(productId: number): void {
    if (!this.selectedImageFile) {
      this.finishSaveFlow();
      return;
    }

    this.adminService.uploadProductImage(productId, this.selectedImageFile).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Image upload failed.');
          this.finishSaveFlow();
          return;
        }

        this.notificationService.success('Product image updated successfully.');
        this.finishSaveFlow();
      },
      error: () => {
        this.notificationService.error('Failed to upload product image.');
        this.finishSaveFlow();
      }
    });
  }

  private prepareImageUploadStep(name: string, description: string): void {
    this.isModalOpen = false;
    this.editingProductId = null;
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
    this.pendingUploadPreview = null;
    this.pendingUploadFile = null;
    this.pendingProductName = name;
    this.isSubmitting = false;

    this.adminService.getProducts(1, 50, name).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error('Product created, but we could not prepare image upload.');
          this.loadProducts();
          return;
        }

        const exactMatches = response.data.data.filter(product => product.name.trim().toLowerCase() === name.trim().toLowerCase());
        const matchedProduct = [...exactMatches].sort((a, b) => b.id - a.id)[0]
          ?? [...response.data.data]
            .filter(product => product.description.trim().toLowerCase() === description.trim().toLowerCase())
            .sort((a, b) => b.id - a.id)[0]
          ?? [...response.data.data].sort((a, b) => b.id - a.id)[0];

        if (!matchedProduct) {
          this.notificationService.info('Product created. Open Edit to upload the image because the new product id could not be detected automatically.');
          this.loadProducts();
          return;
        }

        this.pendingProductId = matchedProduct.id;
        this.isImageUploadModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.info('Product created. Open Edit to upload the image because the new product id could not be detected automatically.');
        this.loadProducts();
      }
    });
  }

  private finishSaveFlow(): void {
    this.isModalOpen = false;
    this.editingProductId = null;
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
    this.loadProducts();
  }

  private loadCategories(): void {
    this.categoriesService.getCategories(1, 100).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.categories = response.data.data;
          this.cdr.detectChanges();
        }
      }
    });
  }
}
