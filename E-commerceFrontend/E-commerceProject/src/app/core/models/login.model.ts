export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginApiResponse {
  isSuccess: boolean;
  message: string;
  data?: {
    token?: string;
    user?: LoginUser;
  };
}

export type LoginResponse =
  | LoginApiResponse
  | {
      token?: string;
      accessToken?: string;
      [key: string]: unknown;
    }
  | string;
