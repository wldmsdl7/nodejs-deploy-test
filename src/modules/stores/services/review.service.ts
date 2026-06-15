import { CreateReviewRequest, responseFromReview } from "../dtos/review.dto.js";
import {
  addReview,
  countReviewsByStore,
  getStoreById,
} from "../repositories/review.repository.js";
import { getMyReviewsByStore } from "../repositories/review.repository.js";
import { responseFromReviews } from "../dtos/review.dto.js";
import { AppError } from "../../../common/errors.js";
import { StatusCodes } from "http-status-codes";
import { StoreNotFoundError } from "../../../common/customError.js";

export const createReview = async (
  userId: number,
  storeId: number,
  data: CreateReviewRequest,
) => {
  // 가게 존재 확인
  const store = await getStoreById(storeId);

  if (!store) {
    throw new StoreNotFoundError();
  }

  const review = await addReview(userId, storeId, data);

  return responseFromReview({
    reviewId: Number(review.id),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  });
};

export const getMyReviews = async (
  userId: number,
  storeId: number,
  cursor: number,
  limit: number,
) => {
  const store = await getStoreById(storeId);

  if (!store) {
    throw new StoreNotFoundError();
  }

  const { reviews, hasNext } = await getMyReviewsByStore(
    userId,
    storeId,
    cursor,
    limit,
  );

  const totalCount = await countReviewsByStore(userId, storeId);
  const totalPages = Math.ceil(totalCount / limit);

  return responseFromReviews(reviews, hasNext, totalPages);
};
