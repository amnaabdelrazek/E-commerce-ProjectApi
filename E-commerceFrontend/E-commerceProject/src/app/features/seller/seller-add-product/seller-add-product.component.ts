import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/category.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SellerCreateProductDto, SellerService } from '../seller.service';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-seller-add-product',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seller-add-product.component.html',
  styleUrl: './seller-add-product.component.css'
})
export class SellerAddProductComponent {
  private readonly sellerService = inject(SellerService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly productsService = inject(ProductsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]]
  });

  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  selectedImageFile: File | null = null;
  imageFileName = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  goBack(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.notification.error('Please complete all required product fields.');
      return;
    }

    const formValue = this.productForm.getRawValue();
    const payload: SellerCreateProductDto = {
      ...formValue,
      isFeatured: true
    };

    this.isSubmitting = true;

    this.sellerService.createProduct(payload).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notification.error(response.message || 'Could not create product.');
          return;
        }

        if (!this.selectedImageFile) {
          this.notification.success('Product created successfully.');
          this.router.navigate(['/seller/dashboard']);
          return;
        }

        this.uploadImageForCreatedProduct(payload.name, payload.description);
      },
      error: () => {
        this.notification.error('Failed to create product. Please try again.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImageFile = file;
    this.imageFileName = file?.name ?? '';
  }

  private loadCategories(): void {
    this.isLoading = true;

    this.categoriesService.getCategories(1, 100).subscribe({
      next: (response) => {
        const payload = response as unknown as {
          data?: { data?: Category[] } | Category[];
        };

        if (Array.isArray(payload?.data)) {
          this.categories = payload.data;
        } else {
          this.categories = payload?.data?.data ?? [];
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Failed to load categories.');
        this.cdr.detectChanges();
      }
    });
  }

  private uploadImageForCreatedProduct(name: string, description: string): void {
    this.productsService.getProducts({ pageNumber: 1, pageSize: 50, name }).subscribe({
      next: (productsResponse) => {
        const products = productsResponse?.data?.data ?? [];

        const exactMatches = products.filter(
          (product) => product.name.trim().toLowerCase() === name.trim().toLowerCase()
        );

        const matchedProduct = [...exactMatches].sort((a, b) => b.id - a.id)[0]
          ?? [...products]
            .filter((product) => product.description.trim().toLowerCase() === description.trim().toLowerCase())
            .sort((a, b) => b.id - a.id)[0]
          ?? [...products].sort((a, b) => b.id - a.id)[0];

        if (!matchedProduct || !this.selectedImageFile) {
          this.notification.info('Product created, but image upload requires editing the product later.');
          this.router.navigate(['/seller/dashboard']);
          return;
        }

        this.sellerService.uploadProductImage(matchedProduct.id, this.selectedImageFile).subscribe({
          next: (uploadResponse) => {
            if (!uploadResponse.isSuccess) {
              this.notification.info('Product created, but image upload failed. You can upload it later.');
              this.router.navigate(['/seller/dashboard']);
              return;
            }

            this.notification.success('Product and image uploaded successfully.');
            this.router.navigate(['/seller/dashboard']);
          },
          error: () => {
            this.notification.info('Product created, but image upload failed. You can upload it later.');
            this.router.navigate(['/seller/dashboard']);
          }
        });
      },
      error: () => {
        this.notification.info('Product created, but image upload requires editing the product later.');
        this.router.navigate(['/seller/dashboard']);
      }
    });
  }
}
