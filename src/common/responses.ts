export interface SuccessResponseType<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export const success = <T>(
  data: T,
  message = "성공",
  statusCode = 200,
): SuccessResponseType<T> => ({
  success: true,
  statusCode,
  message,
  data,
});

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  data: null;
}
