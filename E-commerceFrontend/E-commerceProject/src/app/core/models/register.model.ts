export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
   role: string;
}

export interface RegisterSellerRequest extends RegisterRequest {
  storeName: string;
  businessAddress: string;
  storeDescription: string;
}

export interface RegisterApiResponse {
  isSuccess: boolean;
  message: string;
  data?: {
    userId?: string;
    token?: string;
  };
}

