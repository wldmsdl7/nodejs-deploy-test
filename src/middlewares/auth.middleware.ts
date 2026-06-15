import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { AppError } from "../common/errors.js";

export function authorizeUser() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // cookie-parser가 만들어준 req.cookies 객체에서 username을 확인
    const { username } = req.cookies;
    if (username) {
      console.log(`[인증 성공] ${username}님, 환영합니다.`);
      next();
    } else {
      console.log("[인증 실패] 로그인이 필요합니다.");
      res
        .status(401)
        .send(
          '<script>alert("로그인이 필요합니다!");location.href="/api/v1/users/login";</script>',
        );
    }
  };
}

export const expressAuthentication = (
  request: Request,
  securityName: string,
  scopes?: string[],
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (securityName === "jwt") {
      passport.authenticate(
        "jwt",
        { session: false },
        (err: any, user: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (!user) {
            reject(new AppError("로그인이 필요한 서비스입니다.", 401));
            return;
          }

          resolve(user);
        },
      )(request);
    } else {
      reject(new Error("지원하지 않는 인증 방식입니다."));
    }
  });
};
