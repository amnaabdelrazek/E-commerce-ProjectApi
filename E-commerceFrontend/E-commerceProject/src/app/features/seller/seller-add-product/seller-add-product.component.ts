import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/category.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SellerCreateProductDto, SellerService } from '../seller.service';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-seller-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seller-add-product-modern.html',
  styleUrls: [
    './seller-add-product.component.css',
    './seller-add-product-modern.css',
    '../seller-animations.css'
  ]
})
export class SellerAddProductComponent implements OnInit {
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
  currentImagePreview: string | null = null;
  imageHint = '';

  ngOnInit(): void {
    console.log('SellerAddProductComponent initialized');
    this.loadCategories();
  }

  goBack(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  onSubmit(): void {
    console.log('Submit triggered');
    console.log('Form Validity:', this.productForm.valid);
    console.log('Form Value:', this.productForm.getRawValue());
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.notification.error('Please complete all required product fields.');
      return;
    }

    const payload = this.productForm.getRawValue();
    this.isSubmitting = true;

    this.sellerService.createProduct(payload).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notification.error(response.message || 'Could not create product.');
          this.isSubmitting = false;
          return;
        }

        this.notification.success('Product created successfully.');

        if (!this.selectedImageFile) {
          this.router.navigate(['/seller/dashboard']);
          return;
        }

        this.uploadImageForCreatedProduct(payload.name, payload.description);
      },
      error: (err) => {
        console.error('Create product error:', err);
        this.notification.error('Failed to create product. Please try again.');
        this.isSubmitting = false;
      }
      // Note: complete is not used here because uploadImageForCreatedProduct is async
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImageFile = file;
    this.imageFileName = file?.name ?? '';

    if (!file) {
      this.currentImagePreview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.currentImagePreview = typeof reader.result === 'string' ? reader.result : this.currentImagePreview;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  private loadCategories(): void {
    this.isLoading = true;

    this.categoriesService.getCategories(1, 100).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.categories = response.data.data;
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
    // Attempt to find the product we just created to get its ID
    this.productsService.getProducts({ pageNumber: 1, pageSize: 50, name }).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notification.info('Product created, but we could not prepare image upload.');
          this.router.navigate(['/seller/dashboard']);
          return;
        }

        const products = response.data.data;
        const exactMatches = products.filter(
          (product) => product.name.trim().toLowerCase() === name.trim().toLowerCase()
        );

        const matchedProduct = [...exactMatches].sort((a, b) => b.id - a.id)[0]
          ?? [...products]
            .filter((product) => product.description.trim().toLowerCase() === description.trim().toLowerCase())
            .sort((a, b) => b.id - a.id)[0]
          ?? [...products].sort((a, b) => b.id - a.id)[0];

        if (!matchedProduct || !this.selectedImageFile) {
          this.notification.info('Product created. You can upload its image later from the edit page.');
          this.router.navigate(['/seller/dashboard']);
          return;
        }

        this.sellerService.uploadProductImage(matchedProduct.id, this.selectedImageFile).subscribe({
          next: (uploadResponse) => {
            if (!uploadResponse.isSuccess) {
              this.notification.info('Product created, but image upload failed.');
            } else {
              this.notification.success('Product image uploaded successfully.');
            }
            this.router.navigate(['/seller/dashboard']);
          },
          error: () => {
            this.notification.info('Product created, but image upload failed.');
            this.router.navigate(['/seller/dashboard']);
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      },
      error: () => {
        this.notification.info('Product created. You can upload its image later.');
        this.router.navigate(['/seller/dashboard']);
        this.isSubmitting = false;
      }
    });
  }
}
