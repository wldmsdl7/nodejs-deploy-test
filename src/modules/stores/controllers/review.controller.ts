import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Response,
  Tags,
  Example,
  Request,
  Middlewares,
  Security,
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import { createReview, getMyReviews } from "../services/review.service.js";
import {
  CreateReviewRequest,
  CreateReviewResponse,
  GetReviewsResult,
} from "../dtos/review.dto.js";
import {
  ErrorResponse,
  success,
  SuccessResponseType,
} from "../../../common/responses.js";
import {
  InvalidPaginationQueryError,
  InvalidStarRateError,
  InvalidStoreIdError,
  MissingReviewFieldError,
  UnauthorizedUserError,
} from "../../../common/customError.js";
import { User } from "@prisma/client";
import { Request as ExRequest } from "express";

@Route("/api/v1/stores")
@Tags("Review")
export class ReviewController extends Controller {
  /**
   * 특정 가게에 대한 리뷰를 작성합니다.
   *
   * - 별점은 0~5 사이여야 합니다.
   * - 리뷰 내용과 별점은 필수 입력값입니다.
   *
   * @summary 리뷰 생성 API
   * @param storeId 리뷰를 작성할 가게의 고유 ID
   * @param data 리뷰 생성 요청 정보
   */
  @SuccessResponse(StatusCodes.CREATED, "리뷰 생성 성공")
  @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, "잘못된 요청", {
    success: false,
    statusCode: 400,
    message: "잘못된 요청입니다.",
    data: null,
  })
  @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, "인증 실패", {
    success: false,
    statusCode: 401,
    message: "사용자 정보가 없습니다.",
    data: null,
  })
  @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, "서버 오류", {
    success: false,
    statusCode: 500,
    message: "서버 오류가 발생했습니다.",
    data: null,
  })
  @Security("jwt")
  @Post("{storeId}/reviews")
  @Example<SuccessResponseType<CreateReviewResponse>>({
    success: true,
    statusCode: 201,
    message: "리뷰 생성이 완료되었습니다.",
    data: {
      reviewId: 1,
      createdAt: "2026-05-17T13:38:08.264Z",
      updatedAt: "2026-05-17T13:38:08.264Z",
    },
  })
  public async handleCreateReview(
    @Path() storeId: number,
    @Request() req: ExRequest,
    @Body() data: CreateReviewRequest,
  ) {
    console.log("리뷰 생성을 요청했습니다!");

    const user = req.user as User | undefined;

    const userId = Number(user?.id);

    // storeId 검증
    if (!storeId || Number.isNaN(storeId)) {
      throw new InvalidStoreIdError();
    }

    // userId 검증
    if (!userId) {
      throw new UnauthorizedUserError();
    }

    const { content, starRate } = data;

    // body 검증
    if (!content || starRate === undefined) {
      throw new MissingReviewFieldError();
    }

    // 별점 범위 체크
    if (starRate < 0 || starRate > 5) {
      throw new InvalidStarRateError();
    }

    const review = await createReview(userId, storeId, {
      content,
      starRate,
    });

    this.setStatus(StatusCodes.CREATED);

    return success(review, "리뷰 생성이 완료되었습니다.", StatusCodes.CREATED);
  }
  /**
   * 특정 가게에 작성한 내 리뷰 목록을 커서 기반 페이징으로 조회합니다.
   *
   * - cursor를 기준으로 다음 리뷰 목록을 조회합니다.
   * - limit 값으로 조회 개수를 조절할 수 있습니다.
   *
   * @summary 내 리뷰 목록 조회 API
   * @param storeId 리뷰를 조회할 가게의 고유 ID
   * @param cursor 페이징 기준이 되는 마지막 리뷰 ID
   * @param limit 한 번에 조회할 리뷰 개수
   */
  @SuccessResponse(StatusCodes.OK, "내 리뷰 목록 조회 성공")
  @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, "잘못된 요청", {
    success: false,
    statusCode: 400,
    message: "잘못된 요청입니다.",
    data: null,
  })
  @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, "인증 실패", {
    success: false,
    statusCode: 401,
    message: "사용자 정보가 없습니다.",
    data: null,
  })
  @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, "서버 오류", {
    success: false,
    statusCode: 500,
    message: "서버 오류가 발생했습니다.",
    data: null,
  })
  @Security("jwt")
  @Get("{storeId}/reviews/me")
  @Example<SuccessResponseType<GetReviewsResult>>({
    success: true,
    statusCode: 200,
    message: "내 리뷰 목록 조회를 성공했습니다.",
    data: {
      reviews: [
        {
          id: 1,
          content: "너무 맛있어요!",
          starRate: 4.5,
          userName: "UMC",
          createdAt: "2026-05-17T13:38:08.264Z",
        },
        {
          id: 2,
          content: "우웩.. 개똥맛",
          starRate: 1,
          userName: "UMC123",
          createdAt: "2026-05-17T13:38:08.264Z",
        },
      ],
      totalPages: 1,
      hasNext: false,
    },
  })
  public async handleGetMyReviews(
    @Path() storeId: number,
    @Request() req: ExRequest,
    @Query() cursor: number = 0,
    @Query() limit: number = 10,
  ) {
    console.log("내 리뷰 목록 조회를 요청했습니다!");

    const user = req.user as User | undefined;

    const userId = Number(user?.id);

    // userId 검증
    if (!userId) {
      throw new UnauthorizedUserError();
    }

    // storeId 검증
    if (!storeId || Number.isNaN(storeId)) {
      throw new InvalidStoreIdError();
    }

    // cursor, limit 검증
    if (Number.isNaN(cursor) || Number.isNaN(limit) || limit < 1) {
      throw new InvalidPaginationQueryError();
    }

    const reviews = await getMyReviews(userId, storeId, cursor, limit);

    return success(
      reviews,
      "내 리뷰 목록 조회를 성공했습니다.",
      StatusCodes.OK,
    );
  }
}
