export interface Review {
  id: number;
  productId: number;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}
