import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart-service';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/category.model';
import { FormsModule } from '@angular/forms';
import { AuthService, CurrentUser } from '../../../core/services/auth.service';

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

  public readonly categories = signal<Category[]>([]);
  public readonly categoriesState = signal<CategoriesState>('loading');
  public searchTerm = '';

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
    return this.auth.currentUser()?.role?.toLowerCase() === 'admin' ? '/admin/profile' : '/profile';
  }

  public get accountLabel(): string {
    return this.auth.currentUser()?.userName || this.auth.currentUser()?.email || 'Account';
  }
}

