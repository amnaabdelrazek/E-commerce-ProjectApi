import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormErrorPipe } from '../../../shared/pipes/form-error.pipe';
import { TogglePasswordDirective } from '../../../shared/directives/toggle-password.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormErrorPipe, TogglePasswordDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [true]
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  submit() {
    this.submitted.set(true);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { rememberMe, ...dto } = this.form.getRawValue();

    this.auth.login(dto, rememberMe).subscribe({
      next: async () => {
        this.loading.set(false);
        await this.router.navigateByUrl('/home');
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.serverError.set(this.extractErrorMessage(err));
      }
    });
  }

  googleSignIn() {
    this.serverError.set('Google sign-in is not configured yet.');
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const backend = err.error;
      if (typeof backend === 'string' && backend.trim()) return backend;
      if (backend && typeof backend === 'object') {
        const maybeMessage = (backend as { message?: unknown }).message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
      }
      return err.status ? `Login failed (HTTP ${err.status}).` : 'Login failed.';
    }
    return 'Login failed.';
  }
}
