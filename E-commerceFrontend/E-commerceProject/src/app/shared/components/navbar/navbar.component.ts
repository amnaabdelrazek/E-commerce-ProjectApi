import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart-service';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/category.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';

type CategoriesState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  public readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  public readonly auth = inject(AuthService);
  public readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  public readonly categories = signal<Category[]>([]);
  public readonly categoriesState = signal<CategoriesState>('loading');
  public readonly profileImageUrl = signal<string | null>(null);
  public searchTerm = '';
  public readonly defaultAvatarUrl = '/default-avatar.svg';

  public ngOnInit(): void {
    this.categoriesService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res?.data?.data ?? []);
        this.categoriesState.set('loaded');
      },
      error: () => {
        this.categoriesState.set('error');
      }
    });

    if (this.auth.currentUser()) {
      this.loadProfileImage();
    }
  }

  public submitSearch(): void {
    const term = this.searchTerm.trim();
    void this.router.navigate(['/shop'], {
      queryParams: {
        name: term || null,
        categoryId: null
      }
    });
  }

  public get accountRoute(): string {
    const currentUser = this.auth.currentUser();

    if (!currentUser) {
      return '/login';
    }

    return currentUser.role?.toLowerCase() === 'admin' ? '/admin/profile' : '/profile';
  }

  public get accountLabel(): string {
    return this.auth.currentUser()?.userName || this.auth.currentUser()?.email || 'Account';
  }

  public get avatarUrl(): string {
    const imageUrl = this.profileImageUrl();
    if (!imageUrl) {
      return this.defaultAvatarUrl;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `${this.apiBaseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  }

  public onAvatarError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }

    image.src = this.defaultAvatarUrl;
  }

  private loadProfileImage(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.profileImageUrl.set(response?.data?.profileImageUrl ?? null);
      },
      error: () => {
        this.profileImageUrl.set(null);
      }
    });
  }
}

