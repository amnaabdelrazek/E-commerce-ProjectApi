import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
import { CategoriesService } from '../../../core/services/categories.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  readonly auth = inject(AuthService);
  readonly year = new Date().getFullYear();
  readonly categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.categoriesService.getCategories(1, 6).subscribe({
      next: (res) => this.categories.set(res?.data?.data ?? [])
    });
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

