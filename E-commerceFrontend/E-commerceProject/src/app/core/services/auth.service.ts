import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { LoginApiResponse, LoginRequest, LoginResponse } from '../models/login.model';
import { ConfirmEmailApiResponse } from '../models/confirm-email.model';
import { RegisterApiResponse, RegisterRequest } from '../models/register.model';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly tokenStorage = inject(TokenStorageService);

  login(dto: LoginRequest, rememberMe: boolean) {
    return this.http
      .post<LoginResponse | LoginApiResponse>(`${this.apiBaseUrl}/api/Auth/login`, dto)
      .pipe(
        tap((res) => {
          const token = this.extractToken(res);

          if (token && typeof token === 'string') {
            this.tokenStorage.setToken(token, rememberMe);
          }
        })
      );
  }

  register(dto: RegisterRequest) {
    return this.http.post<RegisterApiResponse>(`${this.apiBaseUrl}/api/Auth/register`, dto);
  }

  confirmEmail(userId: string, token: string) {
    return this.http.get<ConfirmEmailApiResponse>(`${this.apiBaseUrl}/api/Auth/confirm-email`, {
      params: { userId, token }
    });
  }

  logout(): void {
    this.tokenStorage.clearToken();
  }

  private extractToken(res: LoginResponse | LoginApiResponse): string | undefined {
    if (typeof res === 'string') return res;
    if (!res || typeof res !== 'object') return undefined;

    const asAny = res as Record<string, unknown>;

    const token = asAny['token'];
    if (typeof token === 'string') return token;

    const accessToken = asAny['accessToken'];
    if (typeof accessToken === 'string') return accessToken;

    const data = asAny['data'];
    if (data && typeof data === 'object') {
      const dataToken = (data as Record<string, unknown>)['token'];
      if (typeof dataToken === 'string') return dataToken;
    }

    return undefined;
  }
}
