import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly status = signal<'success' | 'error'>('success');
  readonly message = signal<string>('Confirming your email…');

  ngOnInit() {
    const userId = this.route.snapshot.queryParamMap.get('userId') ?? '';
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!userId || !token) {
      this.loading.set(false);
      this.status.set('error');
      this.message.set('Missing required parameters (userId, token).');
      return;
    }

    this.auth.confirmEmail(userId, token).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res?.isSuccess) {
          this.status.set('success');
          this.message.set(res.data ?? 'Email confirmed.');
        } else {
          this.status.set('error');
          this.message.set(res?.message || 'Email confirmation failed.');
        }
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.status.set('error');
        this.message.set(this.extractErrorMessage(err));
      }
    });
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const backend = err.error;
      if (typeof backend === 'string' && backend.trim()) return backend;
      if (backend && typeof backend === 'object') {
        const maybeMessage = (backend as { message?: unknown }).message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
      }
      return err.status ? `Confirm email failed (HTTP ${err.status}).` : 'Confirm email failed.';
    }
    return 'Confirm email failed.';
  }
}

