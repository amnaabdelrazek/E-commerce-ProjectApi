export interface Coupon {
  id: number;
  code: string;
  discountAmount: number;
  discountPercentage?: number;
  minimumPurchaseAmount: number;
  expiryDate: string; 
  isActive: boolean;
}


export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}