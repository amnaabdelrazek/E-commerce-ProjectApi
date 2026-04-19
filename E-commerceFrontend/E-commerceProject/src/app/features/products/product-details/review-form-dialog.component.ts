import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReviewsService } from '../../../core/services/reviews.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-review-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="review-form-dialog">
      <h2 mat-dialog-title>Write a Review</h2>
      
      <div mat-dialog-content>
        <div class="form-group">
          <label>Rating</label>
          <div class="rating-selector">
            <button
              type="button"
              class="star-btn"
              *ngFor="let n of [1, 2, 3, 4, 5]"
              (click)="rating.set(n)"
              [class.active]="n <= rating()"
            >
              <mat-icon>{{ n <= rating() ? 'star' : 'star_border' }}</mat-icon>
            </button>
          </div>
          <span class="rating-text">{{ rating() }} / 5</span>
        </div>

        <div class="form-group">
          <label for="comment">Your Review</label>
          <textarea
            id="comment"
            [(ngModel)]="comment"
            placeholder="Share your thoughts about this product..."
            rows="5"
            class="textarea"
          ></textarea>
          <span class="char-count">{{ comment.length }} / 500</span>
        </div>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button
          mat-raised-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="isSubmitting() || rating() === 0 || comment.trim().length < 3"
        >
          {{ isSubmitting() ? 'Posting...' : 'Post Review' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .review-form-dialog {
      min-width: 400px;
    }

    h2 {
      margin-top: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--app-text);
    }

    .rating-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .star-btn:hover {
      background-color: #f5f5f5;
    }

    .star-btn mat-icon {
      color: #ccc;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .star-btn.active mat-icon {
      color: #ffc107;
    }

    .rating-text {
      font-size: 14px;
      color: var(--app-muted);
    }

    .textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--app-border);
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }

    .textarea:focus {
      outline: none;
      border-color: var(--app-text);
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
    }

    .char-count {
      display: block;
      text-align: right;
      font-size: 12px;
      color: var(--app-muted);
      margin-top: 4px;
    }

    [mat-dialog-actions] {
      padding: 16px 0 0;
      margin: 0 -24px -24px -24px;
      padding: 16px 24px 0;
    }
  `]
})
export class ReviewFormDialogComponent {
  private readonly reviewsService = inject(ReviewsService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<ReviewFormDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  readonly rating = signal(0);
  readonly isSubmitting = signal(false);
  comment = '';

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.rating() === 0 || this.comment.trim().length < 3) {
      this.notification.error('Please provide a rating and comment (minimum 3 characters)');
      return;
    }

    if (this.comment.length > 500) {
      this.notification.error('Comment cannot exceed 500 characters');
      return;
    }

    this.isSubmitting.set(true);

    const reviewData = {
      productId: this.data.productId,
      rating: this.rating(),
      comment: this.comment
    };

    console.log('Submitting review:', reviewData);

    this.reviewsService.createReview(reviewData).subscribe({
      next: (res) => {
        console.log('Review submission response:', res);
        if (res.isSuccess) {
          this.notification.success('Review posted successfully!');
          this.dialogRef.close({ success: true, review: res.data });
        } else {
          this.notification.error(res.message || 'Failed to post review');
          this.isSubmitting.set(false);
        }
      },
      error: (err) => {
        console.error('Review submission error:', err);
        const errorMsg = err?.error?.message || err?.message || 'Failed to post review';
        this.notification.error(errorMsg);
        this.isSubmitting.set(false);
      }
    });
  }
}
