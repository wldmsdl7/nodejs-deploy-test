import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/errors.js";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      data: null,
    });
  }

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "서버 오류가 발생했습니다.",
    data: null,
  });
};

export default errorHandler;
