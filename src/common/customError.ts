import { AppError } from "./errors.js";

export class DuplicateUserEmailError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("이미 존재하는 이메일입니다.", 409);
    this.errorCode = "U001";
    this.data = data;
  }
}

export class InvalidEmailFormatError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("올바르지 않은 이메일 형식입니다.", 400);
    this.errorCode = "U002";
    this.data = data;
  }
}

export class InvalidPasswordError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("비밀번호는 6자 이상이어야 합니다.", 400);
    this.errorCode = "U003";
    this.data = data;
  }
}

export class EmptyPreferencesError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("선호 카테고리를 최소 1개 선택해야 합니다.", 400);
    this.errorCode = "U004";
    this.data = data;
  }
}

export class UnauthorizedUserError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("사용자 정보가 없습니다.", 401);

    this.errorCode = "U005";
    this.data = data;
  }
}

export class InvalidMissionIdError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("유효하지 않은 missionId 입니다.", 400);

    this.errorCode = "M001";
    this.data = data;
  }
}

export class AlreadyChallengingMissionError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("이미 도전 중인 미션입니다.", 409);

    this.errorCode = "M002";
    this.data = data;
  }
}

export class MissionNotFoundError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("존재하지 않는 미션입니다.", 404);

    this.errorCode = "M003";
    this.data = data;
  }
}

export class UserMissionNotFoundError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("해당 미션을 도전한 기록이 없습니다.", 404);

    this.errorCode = "M004";
    this.data = data;
  }
}

export class AlreadyCompletedMissionError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("이미 완료된 미션입니다.", 409);

    this.errorCode = "M005";
    this.data = data;
  }
}

export class InvalidStoreIdError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("유효하지 않은 storeId 입니다.", 400);

    this.errorCode = "S001";
    this.data = data;
  }
}

export class MissingReviewFieldError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("필수값이 누락되었습니다.", 400);

    this.errorCode = "R001";
    this.data = data;
  }
}

export class InvalidStarRateError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("별점은 0~5 사이여야 합니다.", 400);

    this.errorCode = "R002";
    this.data = data;
  }
}

export class InvalidPaginationQueryError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("유효하지 않은 cursor 또는 limit 입니다.", 400);

    this.errorCode = "R003";
    this.data = data;
  }
}

export class RegionNotFoundError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("존재하지 않는 지역입니다.", 404);

    this.errorCode = "S002";
    this.data = data;
  }
}

export class StoreNotFoundError extends AppError {
  data?: unknown;
  errorCode: string;

  constructor(data?: unknown) {
    super("존재하지 않는 가게입니다.", 404);

    this.errorCode = "S003";
    this.data = data;
  }
}
