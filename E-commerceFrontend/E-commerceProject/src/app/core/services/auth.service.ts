import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { LoginApiResponse, LoginRequest, LoginResponse } from '../models/login.model';
import { ConfirmEmailApiResponse } from '../models/confirm-email.model';
import { RegisterApiResponse, RegisterRequest } from '../models/register.model';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { TokenStorageService } from './token-storage.service';

export interface CurrentUser {
  id: string;
  email: string;
  userName?: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly tokenStorage = inject(TokenStorageService);
  readonly currentUser = signal<CurrentUser | null>(null);

  constructor() {
    this.currentUser.set(this.readCurrentUserFromToken());
  }

  login(dto: LoginRequest, rememberMe: boolean) {
    return this.http
      .post<LoginResponse | LoginApiResponse>(`${this.apiBaseUrl}/api/Auth/login`, dto)
      .pipe(
        tap((res) => {
          const token = this.extractToken(res);

          if (token && typeof token === 'string') {
            this.tokenStorage.setToken(token, rememberMe);
            this.currentUser.set(this.readCurrentUserFromToken());
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
    this.currentUser.set(null);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser();
  }

  private readCurrentUserFromToken(): CurrentUser | null {
    const token = this.tokenStorage.getToken();
    if (!token) return null;

    try {
      const decoded = this.decodeToken(token);
      return {
        id: decoded['sub'] || decoded['id'] || '',
        email: decoded['email'] || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
        userName: decoded['name'] || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
        role: decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || ''
      };
    } catch (error) {
      return null;
    }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');

      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch {
      throw new Error('Failed to decode token');
    }
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

  // getUserFromToken(){
  //   const token = this.tokenStorage.getToken();
  //   if(!token)
  //     return null;

  //   try{
  //     const decoded: any = jwtDecode(token);

  //     return {
  //     email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email,
  //     fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.fullName || 'User',
  //   };
  // }catch (error) {
  //   console.error('Error decoding token', error);
  //   return null;
  // }
  // }

  getProfile(){
    return this.http.get<any>(`${this.apiBaseUrl}/api/Users/profile`)
  }
}

