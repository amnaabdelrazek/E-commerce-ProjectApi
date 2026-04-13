import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { API_BASE_URL } from '../../core/tokens/api-base-url.token';
import { Profile } from '../../core/models/profile.model';

type LoadState = 'loading' | 'loaded' | 'error';
type ProfileView = Profile & {
  ordersCount?: number | null;
  wishlistCount?: number | null;
  reviewsCount?: number | null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  readonly state = signal<LoadState>('loading');
  readonly profile = signal<ProfileView | null>(null);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly passwordMessage = signal<string | null>(null);
  readonly avatarMessage = signal<string | null>(null);

  readonly placeholder = '/product-placeholder.svg';
  private pendingImageFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    city: [''],
    street: ['']
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    const token = this.tokenStorage.getToken();
    if (!token) {
      void this.router.navigate(['/login']);
      return;
    }

    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res?.data) {
          const profileData: ProfileView = {
            ...res.data,
            ordersCount: res.data.ordersCount ?? null,
            wishlistCount: res.data.wishlistCount ?? null,
            reviewsCount: res.data.reviewsCount ?? null
          };
          this.profile.set(profileData);
          this.form.patchValue({
            fullName: res.data.fullName ?? '',
            city: res.data.city ?? '',
            street: res.data.street ?? ''
          });
        } else {
          this.profile.set(null);
        }
        this.state.set(res?.data ? 'loaded' : 'error');
      },
      error: () => this.state.set('error')
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.placeholder;
  }

  resolveImageUrl(url: string | null) {
    if (!url) return this.placeholder;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${this.apiBaseUrl}${url}`;
  }

  toggleEdit() {
    this.message.set(null);
    this.editing.set(!this.editing());
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.pendingImageFile = file;
    this.avatarMessage.set(file ? file.name : null);
  }

  uploadAvatar() {
    if (!this.pendingImageFile) return;
    this.avatarMessage.set('Uploading...');
    this.userService.uploadImage(this.pendingImageFile).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const current = this.profile();
          if (current) {
            this.profile.set({ ...current, profileImageUrl: res.data });
          }
          this.pendingImageFile = null;
          this.avatarMessage.set('Photo updated.');
        } else {
          this.avatarMessage.set(res?.message || 'Upload failed.');
        }
      },
      error: () => this.avatarMessage.set('Upload failed.')
    });
  }

  saveProfile() {
    this.message.set(null);
    this.saving.set(true);

    const formData = new FormData();
    const { fullName, city, street } = this.form.getRawValue();

    formData.append('FullName', fullName);
    formData.append('City', city || '');
    formData.append('Street', street || '');

    if (this.pendingImageFile) {
      formData.append('ProfileImage', this.pendingImageFile);
    }

    this.userService.updateProfile(formData).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res?.isSuccess) {
          const current = this.profile();
          if (current) {
            this.profile.set({
              ...current,
              fullName,
              city: city || '',
              street: street || ''
            });
          }
          this.message.set('Profile updated.');
          this.editing.set(false);
        } else {
          this.message.set(res?.message || 'Update failed.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.message.set('Update failed.');
      }
    });
  }

  changePassword() {
    this.passwordMessage.set(null);
    if (this.passwordForm.invalid) {
      this.passwordMessage.set('Please fill all fields.');
      return;
    }
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.passwordMessage.set('Password changed.');
          this.passwordForm.reset({ currentPassword: '', newPassword: '' });
        } else {
          this.passwordMessage.set(res?.message || 'Password change failed.');
        }
      },
      error: () => this.passwordMessage.set('Password change failed.')
    });
  }

  signOut() {
    this.tokenStorage.clearToken();
    void this.router.navigate(['/login']);
  }
}
