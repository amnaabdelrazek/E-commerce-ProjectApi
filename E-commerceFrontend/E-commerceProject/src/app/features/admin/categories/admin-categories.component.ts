import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  AdminCategory,
  AdminService,
  CreateCategoryDto,
  UpdateCategoryDto
} from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

type CategoryModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: [
    './admin-categories.component.css',
    '../tables/tables-animations.css'
  ]
})
export class AdminCategoriesComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  categories: AdminCategory[] = [];
  isLoading = false;
  isSubmitting = false;
  isModalOpen = false;
  isImageUploadModalOpen = false;
  isDeleteModalOpen = false;
  modalMode: CategoryModalMode = 'create';
  editingCategoryId: number | null = null;
  page = 1;
  pageSize = 12;
  totalItems = 0;
  searchTerm = '';
  errorMessage = '';
  hasLoadedOnce = false;
  currentImagePreview: string | null = null;
  selectedImageFile: File | null = null;
  imageHint = '';
  pendingCategoryId: number | null = null;
  pendingCategoryName = '';
  pendingUploadPreview: string | null = null;
  pendingUploadFile: File | null = null;
  pendingDeleteCategory: AdminCategory | null = null;
  private currentLoadId = 0;

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    setTimeout(() => this.loadCategories(), 0);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingCategoryId = null;
    this.categoryForm.reset({
      name: '',
      description: ''
    });
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
    this.isModalOpen = true;
  }

  openEditModal(category: AdminCategory): void {
    this.modalMode = 'edit';
    this.editingCategoryId = category.id;
    this.categoryForm.reset({
      name: category.name,
      description: category.description
    });
    this.currentImagePreview = category.imageUrl;
    this.selectedImageFile = null;
    this.imageHint = 'Choose a new image to replace the current category image.';
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isModalOpen = false;
    this.editingCategoryId = null;
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
  }

  closeImageUploadModal(forceReload = true): void {
    if (this.isSubmitting && forceReload) {
      return;
    }

    this.isImageUploadModalOpen = false;
    this.pendingCategoryId = null;
    this.pendingCategoryName = '';
    this.pendingUploadPreview = null;
    this.pendingUploadFile = null;

    if (forceReload) {
      this.loadCategories();
    }
  }

  openDeleteModal(category: AdminCategory): void {
    this.pendingDeleteCategory = category;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(force = false): void {
    if (this.isSubmitting && !force) {
      return;
    }

    this.isDeleteModalOpen = false;
    this.pendingDeleteCategory = null;
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
    this.page = 1;
    this.loadCategories();
  }

  clearSearch(searchInput: HTMLInputElement): void {
    searchInput.value = '';
    this.searchTerm = '';
    this.page = 1;
    this.loadCategories();
  }

  retryLoadCategories(): void {
    this.loadCategories();
  }

  submitForm(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = this.categoryForm.getRawValue();
    this.isSubmitting = true;

    const request$ = this.modalMode === 'edit' && this.editingCategoryId !== null
      ? this.adminService.updateCategory(this.editingCategoryId, payload as UpdateCategoryDto)
      : this.adminService.createCategory(payload as CreateCategoryDto);

    request$.subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Could not save category.');
          return;
        }

        this.notificationService.success(
          this.modalMode === 'edit' ? 'Category updated successfully.' : 'Category created successfully.'
        );

        if (this.modalMode === 'edit' && this.editingCategoryId !== null && this.selectedImageFile) {
          this.uploadImageForExistingCategory(this.editingCategoryId);
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
          this.modalMode === 'edit' ? 'Failed to update category.' : 'Failed to create category.'
        );
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  deleteCategory(category: AdminCategory): void {
    this.openDeleteModal(category);
  }

  confirmDeleteCategory(): void {
    if (!this.pendingDeleteCategory) {
      return;
    }

    const category = this.pendingDeleteCategory;
    this.isSubmitting = true;

    this.adminService.deleteCategory(category.id).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Could not delete category.');
          return;
        }

        this.notificationService.success('Category deleted successfully.');
        this.closeDeleteModal(true);
        this.loadCategories();
      },
      error: () => {
        this.notificationService.error('Failed to delete category.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.page = page;
    this.loadCategories();
  }

  trackByCategoryId(_: number, category: AdminCategory): number {
    return category.id;
  }

  submitPendingImageUpload(): void {
    if (!this.pendingCategoryId) {
      this.notificationService.error('Could not detect the created category.');
      return;
    }

    if (!this.pendingUploadFile) {
      this.notificationService.error('Please choose an image first.');
      return;
    }

    this.isSubmitting = true;

    this.adminService.uploadCategoryImage(this.pendingCategoryId, this.pendingUploadFile).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Category image upload failed.');
          return;
        }

        this.notificationService.success('Category image uploaded successfully.');
        this.isImageUploadModalOpen = false;
        this.pendingCategoryId = null;
        this.pendingCategoryName = '';
        this.pendingUploadPreview = null;
        this.pendingUploadFile = null;
        this.loadCategories();
      },
      error: () => {
        this.notificationService.error('Failed to upload category image.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private loadCategories(): void {
    const loadId = ++this.currentLoadId;
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getCategories(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        if (loadId !== this.currentLoadId) {
          return;
        }

        if (!response.isSuccess) {
          this.categories = [];
          this.totalItems = 0;
          this.errorMessage = response.message || 'Could not load categories.';
          this.notificationService.error(this.errorMessage);
          return;
        }

        this.categories = response.data.data;
        this.totalItems = response.data.totalItems ?? this.categories.length;
        this.page = response.data.page ?? this.page;
        this.pageSize = response.data.pageSize ?? this.pageSize;
        this.errorMessage = '';
      },
      error: () => {
        if (loadId !== this.currentLoadId) {
          return;
        }

        this.categories = [];
        this.totalItems = 0;
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.notificationService.error(this.errorMessage);
      },
      complete: () => {
        if (loadId === this.currentLoadId) {
          this.isLoading = false;
          this.hasLoadedOnce = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

  private uploadImageForExistingCategory(categoryId: number): void {
    if (!this.selectedImageFile) {
      this.finishSaveFlow();
      return;
    }

    this.adminService.uploadCategoryImage(categoryId, this.selectedImageFile).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error(response.message || 'Category image upload failed.');
          this.finishSaveFlow();
          return;
        }

        this.notificationService.success('Category image updated successfully.');
        this.finishSaveFlow();
      },
      error: () => {
        this.notificationService.error('Failed to upload category image.');
        this.finishSaveFlow();
      }
    });
  }

  private prepareImageUploadStep(name: string, description: string): void {
    this.isModalOpen = false;
    this.editingCategoryId = null;
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
    this.pendingUploadPreview = null;
    this.pendingUploadFile = null;
    this.pendingCategoryName = name;
    this.isSubmitting = false;

    this.adminService.getCategories(1, 50, name).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.notificationService.error('Category created, but we could not prepare image upload.');
          this.loadCategories();
          return;
        }

        const exactMatches = response.data.data.filter(category => category.name.trim().toLowerCase() === name.trim().toLowerCase());
        const matchedCategory = [...exactMatches].sort((a, b) => b.id - a.id)[0]
          ?? [...response.data.data]
            .filter(category => category.description.trim().toLowerCase() === description.trim().toLowerCase())
            .sort((a, b) => b.id - a.id)[0]
          ?? [...response.data.data].sort((a, b) => b.id - a.id)[0];

        if (!matchedCategory) {
          this.notificationService.info('Category created. Open Edit to upload the image because the new category id could not be detected automatically.');
          this.loadCategories();
          return;
        }

        this.pendingCategoryId = matchedCategory.id;
        this.isImageUploadModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.info('Category created. Open Edit to upload the image because the new category id could not be detected automatically.');
        this.loadCategories();
      }
    });
  }

  private finishSaveFlow(): void {
    this.isModalOpen = false;
    this.editingCategoryId = null;
    this.currentImagePreview = null;
    this.selectedImageFile = null;
    this.imageHint = '';
    this.loadCategories();
  }
}
