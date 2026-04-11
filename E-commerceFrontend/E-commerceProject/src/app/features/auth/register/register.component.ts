import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterApiResponse } from '../../../core/models/register.model';
import { FormErrorPipe } from '../../../shared/pipes/form-error.pipe';
import { TogglePasswordDirective } from '../../../shared/directives/toggle-password.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormErrorPipe, TogglePasswordDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly success = signal<RegisterApiResponse | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    agree: [false, [Validators.requiredTrue]]
  });

  get firstName() {
    return this.form.controls.firstName;
  }
  get lastName() {
    return this.form.controls.lastName;
  }
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
  get agree() {
    return this.form.controls.agree;
  }

  submit() {
    this.submitted.set(true);
    this.serverError.set(null);
    this.success.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { firstName, lastName, email, password } = this.form.getRawValue();
    const fullName = `${firstName} ${lastName}`.trim().replace(/\s+/g, ' ');

    this.auth.register({ fullName, email, password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res?.isSuccess) {
          this.success.set(res);
        } else {
          this.serverError.set(res?.message || 'Register failed.');
        }
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.serverError.set(this.extractErrorMessage(err));
      }
    });
  }

  goToConfirmEmail() {
    const res = this.success();
    const userId = res?.data?.userId;
    const token = res?.data?.token;
    if (!userId || !token) return;
    void this.router.navigate(['/confirm-email'], { queryParams: { userId, token } });
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const backend = err.error;
      if (typeof backend === 'string' && backend.trim()) return backend;
      if (backend && typeof backend === 'object') {
        const maybeMessage = (backend as { message?: unknown }).message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
      }
      return err.status ? `Register failed (HTTP ${err.status}).` : 'Register failed.';
    }
    return 'Register failed.';
  }
}
