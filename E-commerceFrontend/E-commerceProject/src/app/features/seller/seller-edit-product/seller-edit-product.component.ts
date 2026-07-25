import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../core/models/category.model';
import { CategoriesService } from '../../../core/services/categories.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductsService } from '../../../core/services/products.service';
import { SellerService, SellerUpdateProductDto } from '../seller.service';

@Component({
  selector: 'app-seller-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seller-edit-product.component.html',
  styleUrl: './seller-edit-product.component.css'
})
export class SellerEditProductComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly categoriesService = inject(CategoriesService);
  private readonly productsService = inject(ProductsService);
  private readonly sellerService = inject(SellerService);
  private readonly notification = inject(NotificationService);

  productId = 0;
  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  selectedImageFile: File | null = null;
  imageFileName = '';
  currentImagePreview: string | null = null;

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const idFromRoute = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(idFromRoute) || idFromRoute <= 0) {
      this.notification.error('Invalid product id.');
      this.router.navigate(['/seller/dashboard']);
      return;
    }

    this.productId = idFromRoute;
    this.loadCategoriesAndProduct();
  }

  goBack(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImageFile = file;
    this.imageFileName = file?.name ?? '';

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

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.notification.error('Please complete all required product fields.');
      return;
    }

    const payload = this.productForm.getRawValue() as SellerUpdateProductDto;
    this.isSubmitting = true;

    this.sellerService.updateProduct(this.productId, payload).subscribe({
      next: (response) => {
        if (!this.isSuccessfulResponse(response)) {
          this.notification.error(this.getResponseMessage(response, 'Could not update product.'));
          this.isSubmitting = false;
          this.cdr.detectChanges();
          return;
        }

        if (!this.selectedImageFile) {
          this.notification.success(this.getResponseMessage(response, 'Product updated successfully.'));
          this.router.navigate(['/seller/dashboard']);
          return;
        }

        this.uploadProductImage();
      },
      error: () => {
        this.notification.error('Failed to update product. Please try again.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadCategoriesAndProduct(): void {
    this.isLoading = true;

    this.categoriesService.getCategories(1, 100).subscribe({
      next: (categoryResponse) => {
        if (categoryResponse?.isSuccess) {
          this.categories = categoryResponse.data.data;
        }

        this.loadProduct();
      },
      error: () => {
        this.notification.error('Failed to load categories.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadProduct(): void {
    this.productsService.getProductById(this.productId).subscribe({
      next: (response) => {
        if (!response?.isSuccess || !response.data) {
          this.notification.error(response?.message || 'Could not load product details.');
          this.router.navigate(['/seller/dashboard']);
          return;
        }

        const product = response.data;
        const productWithCategoryId = product as typeof product & { categoryId?: number };
        const matchedCategory = this.categories.find((category) => category.name === product.categoryName);
        const resolvedCategoryId =
          (typeof productWithCategoryId.categoryId === 'number' && productWithCategoryId.categoryId > 0
            ? productWithCategoryId.categoryId
            : matchedCategory?.id) ?? 0;

        this.productForm.reset({
          name: product.name,
          description: product.description,
          categoryId: resolvedCategoryId,
          price: product.price,
          stockQuantity: product.stockQuantity
        });

        this.currentImagePreview = product.imageUrl;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Failed to load product details.');
        this.router.navigate(['/seller/dashboard']);
      }
    });
  }

  private uploadProductImage(): void {
    if (!this.selectedImageFile) {
      this.isSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    this.sellerService.uploadProductImage(this.productId, this.selectedImageFile).subscribe({
      next: (response) => {
        if (!this.isSuccessfulResponse(response)) {
          this.notification.info('Product updated, but image upload failed.');
        } else {
          this.notification.success('Product and image updated successfully.');
        }

        this.router.navigate(['/seller/dashboard']);
      },
      error: () => {
        this.notification.info('Product updated, but image upload failed.');
        this.router.navigate(['/seller/dashboard']);
      },
      complete: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  private isSuccessfulResponse(response: unknown): boolean {
    if (response == null) {
      return true;
    }

    if (typeof response === 'string') {
      return true;
    }

    if (typeof response !== 'object') {
      return false;
    }

    const result = response as { isSuccess?: boolean; success?: boolean };
    if (typeof result.isSuccess === 'boolean') {
      return result.isSuccess;
    }
    if (typeof result.success === 'boolean') {
      return result.success;
    }

    return true;
  }

  private getResponseMessage(response: unknown, fallbackMessage: string): string {
    if (!response || typeof response !== 'object') {
      return fallbackMessage;
    }

    const result = response as { message?: string };
    return result.message || fallbackMessage;
  }
}
