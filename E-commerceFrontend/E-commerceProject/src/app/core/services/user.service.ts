import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ProfileResponse } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getProfile() {
    return this.http.get<ProfileResponse>(`${this.apiBaseUrl}/api/Users/profile`);
  }

  updateProfile(payload: FormData) {
    return this.http.put<{ isSuccess: boolean; message: string; data: string }>(
      `${this.apiBaseUrl}/api/Users/profile`,
      payload
    );
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ isSuccess: boolean; message: string; data: string }>(
      `${this.apiBaseUrl}/api/Users/upload-image`,
      formData
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.http.post<{ isSuccess: boolean; message: string; data: unknown }>(
      `${this.apiBaseUrl}/api/Users/change-password`,
      payload
    );
  }
}
