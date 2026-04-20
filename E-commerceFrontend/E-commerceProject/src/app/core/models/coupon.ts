export interface Coupon {
  id: number;
  code: string;
  discountAmount: number | null;
  discountPercentage: number | null;
  minimumPurchaseAmount: number;
  expiryDate: string;
  isActive: boolean;
  maxUses?: number;
  usedCount?: number;
}


export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}
