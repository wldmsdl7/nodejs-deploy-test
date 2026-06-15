import { Prisma } from "@prisma/client";

export interface CreateReviewRequest {
  /**
   * 리뷰 내용
   * @example "너무 맛있어요!"
   */
  content: string;

  /**
   * 리뷰 별점
   * @example "4.5"
   */
  starRate: number;
}

export interface CreateReviewResponse {
  reviewId: number;
  createdAt: string;
  updatedAt: string;
}

export const responseFromReview = (
  review: CreateReviewResponse,
): CreateReviewResponse => {
  return {
    reviewId: review.reviewId,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
};

// Prisma 타입 유틸
type ReviewWithUserName = Prisma.ReviewGetPayload<{
  select: {
    id: true;
    content: true;
    starRate: true;
    createdAt: true;
    user: {
      select: {
        name: true;
      };
    };
  };
}>;

export interface GetReviewResponse {
  id: number;
  content: string;
  starRate: number;
  userName: string;
  createdAt: string;
}

export interface GetReviewsResult {
  reviews: GetReviewResponse[];
  totalPages: number;
  hasNext: boolean;
}

export const responseFromReviews = (
  reviews: ReviewWithUserName[],
  hasNext: boolean,
  totalPages: number,
): GetReviewsResult => {
  return {
    reviews: reviews.map((review) => ({
      id: Number(review.id),
      content: review.content,
      starRate: Number(review.starRate),
      userName: review.user.name,
      createdAt: review.createdAt.toISOString(),
    })),
    hasNext,
    totalPages,
  };
};
