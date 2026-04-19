import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatMenuModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly notification = inject(NotificationService);

  readonly reviews = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    const token = this.tokenStorage.getToken();
    if (!token) {
      void this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    console.log('Loading user reviews...');
    this.reviewsService.getUserReviews().subscribe({
      next: (response: any) => {
        console.log('Reviews loaded:', response);
        if (response.isSuccess && response.data) {
          this.reviews.set(response.data);
          console.log('Total reviews:', response.data.length);
        } else {
          this.error.set(response.message || 'Failed to load reviews');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        const errorMsg = err?.error?.message || err?.message || 'Failed to load reviews. Please try again.';
        this.error.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    void this.router.navigate(['/profile']);
  }

  editReview(reviewId: number) {
    console.log('Edit review:', reviewId);
  }

  deleteReview(reviewId: number) {
    console.log('Deleting review:', reviewId);
    this.reviewsService.deleteReview(reviewId).subscribe({
      next: () => {
        console.log('Review deleted successfully');
        this.reviews.update(reviews => reviews.filter(r => r.id !== reviewId));
        this.notification.success('Review deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting review:', err);
        const errorMsg = err?.error?.message || 'Failed to delete review.';
        this.error.set(errorMsg);
        this.notification.error(errorMsg);
      }
    });
  }
}
