export interface OrderSummary {
  subTotal: number;
  discountAmount: number;
  appliedPromoCode: string | null;
  taxAmount: number;
  shippingCost: number;
  taxRate: number;
  freeShippingThreshold: number;
  total: number;
  items: any[]; 
}

export interface CheckoutRequest {
  email: string;
  firstName: string; // اتعدلت
  lastName: string;  // اتعدلت
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  paymentMethod: string;
  promoCode?: string | null;
  sessionId?: string | null;
  orderNotes?: string | null;
}

export interface ApiResponse<T>{
    isSuccess: boolean;
    message:string;
    data:T;
}