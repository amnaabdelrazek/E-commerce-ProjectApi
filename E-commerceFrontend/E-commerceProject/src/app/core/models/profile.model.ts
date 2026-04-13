export interface Profile {
  id: string;
  fullName: string;
  email: string;
  city: string;
  street: string;
  profileImageUrl: string | null;
  ordersCount: number | null;
  wishlistCount: number | null;
  reviewsCount: number | null;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export type ProfileResponse = ApiResponse<Profile>;
