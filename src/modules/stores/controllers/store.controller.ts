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
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import { createStore, getMissions } from "../services/store.service.js";
import {
  CreateStoreRequest,
  CreateStoreResponse,
  GetMissionsResult,
} from "../dtos/store.dto.js";
import {
  ErrorResponse,
  success,
  SuccessResponseType,
} from "../../../common/responses.js";
import {
  InvalidPaginationQueryError,
  InvalidStoreIdError,
  MissingReviewFieldError,
} from "../../../common/customError.js";

@Route("/api/v1/stores")
@Tags("Store")
export class StoreController extends Controller {
  /**
   * 새로운 가게를 생성합니다.
   *
   * - 가게 이름(name)은 필수입니다.
   * - 가게 카테고리(storeType)는 필수입니다.
   * - 지역 ID(regionId)는 필수입니다.
   *
   * @summary 가게 생성 API
   * @param data 가게 생성 요청 정보
   */
  @SuccessResponse(StatusCodes.CREATED, "가게 생성 성공")
  @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, "잘못된 요청", {
    success: false,
    statusCode: 400,
    message: "잘못된 요청입니다.",
    data: null,
  })
  @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, "서버 오류", {
    success: false,
    statusCode: 500,
    message: "서버 오류가 발생했습니다.",
    data: null,
  })
  @Post("/")
  @Example<SuccessResponseType<CreateStoreResponse>>({
    success: true,
    statusCode: 201,
    message: "가게 생성이 완료되었습니다.",
    data: {
      id: 1,
      name: "용가훠궈",
      createdAt: "2026-05-17T13:38:08.264Z",
      updatedAt: "2026-05-17T13:38:08.264Z",
    },
  })
  public async handleCreateStore(@Body() data: CreateStoreRequest) {
    console.log("가게 생성을 요청했습니다!");
    console.log("body:", data);

    const { name, storeType, regionId } = data;

    // 필수값 검증
    if (!name || !storeType || regionId === undefined) {
      throw new MissingReviewFieldError();
    }

    const store = await createStore({
      name,
      storeType,
      regionId,
    });

    this.setStatus(StatusCodes.CREATED);

    return success(store, "가게 생성이 완료되었습니다.", StatusCodes.CREATED);
  }

  /**
   * 특정 가게에 등록된 미션 목록을 커서 기반 페이징으로 조회합니다.
   *
   * - cursor를 기준으로 다음 미션 목록을 조회합니다.
   * - limit 값으로 조회 개수를 조절할 수 있습니다.
   *
   * @summary 가게 미션 목록 조회 API
   * @param storeId 미션 목록을 조회할 가게의 고유 ID
   * @param cursor 페이징 기준이 되는 마지막 미션 ID
   * @param limit 한 번에 조회할 미션 개수
   */
  @SuccessResponse(StatusCodes.OK, "미션 목록 조회 성공")
  @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, "잘못된 요청", {
    success: false,
    statusCode: 400,
    message: "유효하지 않은 요청입니다.",
    data: null,
  })
  @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, "서버 오류", {
    success: false,
    statusCode: 500,
    message: "서버 오류가 발생했습니다.",
    data: null,
  })
  @Get("{storeId}/missions")
  @Example<SuccessResponseType<GetMissionsResult>>({
    success: true,
    statusCode: 200,
    message: "미션 목록 조회를 성공했습니다.",
    data: {
      missions: [
        {
          id: 1,
          storeName: "용가훠궈",
          category: "중식당",
          description: "용가훠궈 가서 음식 안남기기",
          rewardPoint: 1000,
          expireDate: "2026-05-01",
        },
        {
          id: 2,
          storeName: "화로상회",
          category: "한식",
          description: "고기 10인분 먹기",
          rewardPoint: 500,
          expireDate: "2026-05-01",
        },
      ],
      totalPages: 1,
      hasNext: false,
    },
  })
  public async handleGetMissions(
    @Path() storeId: number,
    @Query() cursor: number = 0,
    @Query() limit: number = 5,
  ) {
    console.log("미션 목록 조회를 요청했습니다!");

    // storeId 검증
    if (!storeId || Number.isNaN(storeId)) {
      throw new InvalidStoreIdError();
    }

    // cursor, limit 검증
    if (Number.isNaN(cursor) || Number.isNaN(limit) || limit < 1) {
      throw new InvalidPaginationQueryError();
    }

    const result = await getMissions(storeId, cursor, limit);

    return success(result, "미션 목록 조회를 성공했습니다.", StatusCodes.OK);
  }
}
