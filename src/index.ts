import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import { RegisterRoutes } from "./generated/routes.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import passport from "passport";
import { googleStrategy, jwtStrategy, kakaoStrategy } from "./auth.config.js";
import { User } from "@prisma/client";

// 1. 환경 변수 설정
dotenv.config();

passport.use(googleStrategy);
passport.use(kakaoStrategy);
passport.use(jwtStrategy);

const app: Express = express();
app.use(morgan("dev")); // 로그 포맷: dev
app.use(cookieParser());

const port = process.env.PORT || 3000;

// 2. 미들웨어 설정
app.use(cors()); // cors 방식 허용
app.use(express.static("public")); // 정적 파일 접근
app.use(express.json()); // request의 본문을 json으로 해석할 수 있도록 함(JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석
app.use(passport.initialize());

// 3. 기본 라우트
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is TypeScript Server!");
});

app.get("/test", (req, res) => {
  res.send("Hello!");
});

// 쿠키 만드는 라우터
app.get("/setcookie", (req, res) => {
  // 'myCookie'라는 이름으로 'hello' 값을 가진 쿠키를 생성
  res.cookie("myCookie", "hello", { maxAge: 60000 }); // 60초간 유효
  res.send("쿠키가 생성되었습니다!");
});

// 쿠키 읽는 라우터
app.get("/getcookie", (req, res) => {
  // cookie-parser 덕분에 req.cookies 객체에서 바로 꺼내 쓸 수 있음
  const myCookie = req.cookies.myCookie;

  if (myCookie) {
    console.log(req.cookies); // { myCookie: 'hello' }
    res.send(`당신의 쿠키: ${myCookie}`);
  } else {
    res.send("쿠키가 없습니다.");
  }
});

// 구글 OAuth2 로그인 라우터
app.get(
  "/oauth2/login/google",
  passport.authenticate("google", {
    session: false,
  }),
);

app.get(
  "/oauth2/callback/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login-failed",
  }),
  (req, res) => {
    res.status(200).json({
      success: true,
      tokens: req.user,
    });
  },
);

app.get(
  "/oauth2/login/kakao",
  passport.authenticate("kakao", {
    session: false,
  }),
);

app.get(
  "/oauth2/callback/kakao",
  passport.authenticate("kakao", {
    session: false,
    failureRedirect: "/login-failed",
  }),
  (req, res) => {
    res.status(200).json({
      success: true,
      tokens: req.user,
    });
  },
);

const isLogin = passport.authenticate("jwt", { session: false });

app.get("/mypage", isLogin, (req, res) => {
  const user = req.user as User;

  res.status(200).json({
    success: true,
    message: "인증 성공!",
    user: {
      ...user,
      id: user.id.toString(),
    },
  });
});

app.get("/login-failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "로그인 실패",
  });
});

const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve("dist/swagger.json"), "utf8"),
);

// 4. API 라우트
const router = express.Router();

RegisterRoutes(router);
app.use(router);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(errorHandler);

// 5. 서버 시작
app.listen(port, () => {
  console.log(`[server]: Server is running at <http://localhost>:${port}`);
});
