export interface ApiResponse<T>{
    isSuccess: boolean;
    message:string;
    data:T;
}

export interface AddToCartResquest{
    productId:number;
    quantity: number;
}

export interface Cart {
   id: number;
  userId: string;
  items: CartItem[];
  subTotal: number; 
  itemCount: number;
}

export interface CartItem{
  id: number; 
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string; 
  quantity: number;
  itemSubtotal: number;
}



export interface PromoCodeRequest {
  promoCode: string;
  subtotal: number;
}


export interface PromoData {
  id: number;
  code: string;
  discountAmount: number;
  discountPercentage: number | null;
  minimumPurchaseAmount: number;
  expiryDate: string;
  isActive: boolean;
  
}