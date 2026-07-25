import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { RouterLink } from '@angular/router';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);

  @ViewChild('categoriesContainer') categoriesContainer?: ElementRef<HTMLDivElement>;

  readonly state = signal<LoadState>('idle');
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);

  private intersectionObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.loadData();
    this.setupRevealOnScroll();
    // Check scroll position after categories load and add scroll listener
    setTimeout(() => {
      this.updateScrollButtons();
      this.setupCategoriesScrollListener();
    }, 100);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  private loadData(): void {
    this.state.set('loading');
    this.categoriesService.getCategories(1, 6).subscribe({
      next: (res) => this.categories.set(res?.data?.data ?? [])
    });
    this.productsService.getProducts({ pageNumber: 1, pageSize: 12 }).subscribe({
      next: (res) => {
        this.products.set(res?.data?.data ?? []);
        this.state.set('loaded');
      },
      error: () => this.state.set('error')
    });
  }

  private setupRevealOnScroll(): void {
    // Create Intersection Observer for reveal-on-scroll animations
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.classList.add('revealed');
            // Get delay if specified
            const delay = element.getAttribute('data-delay');
            if (delay) {
              element.style.setProperty('--reveal-delay', delay);
            }
            this.intersectionObserver?.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Observe all elements with reveal-on-scroll class
    setTimeout(() => {
      const revealElements = document.querySelectorAll('.reveal-on-scroll');
      revealElements.forEach((el) => this.intersectionObserver?.observe(el));
    }, 100);
  }

  get featured(): Product[] {
    return this.products().slice(0, 4);
  }

  get arrivals(): Product[] {
    return this.products().slice(4, 8);
  }

  scrollCategories(direction: 'left' | 'right'): void {
    const container = this.categoriesContainer?.nativeElement;
    if (!container) return;

    const scrollAmount = 300;
    const currentScroll = container.scrollLeft;
    const newScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });

    // Update buttons after scroll
    setTimeout(() => this.updateScrollButtons(), 50);
  }

  private updateScrollButtons(): void {
    const container = this.categoriesContainer?.nativeElement;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const tolerance = 5; // Small tolerance for rounding errors

    this.canScrollLeft.set(scrollLeft > tolerance);
    this.canScrollRight.set(scrollLeft + clientWidth < scrollWidth - tolerance);
  }

  private setupCategoriesScrollListener(): void {
    const container = this.categoriesContainer?.nativeElement;
    if (!container) return;

    container.addEventListener('scroll', () => {
      this.updateScrollButtons();
    });
  }
}

