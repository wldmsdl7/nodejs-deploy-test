import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import {
  Strategy as KakaoStrategy,
  Profile as KakaoProfile,
} from "passport-kakao";
import { prisma } from "./db.config.js";

dotenv.config();

export const generateAccessToken = (user: { id: bigint; email: string }) => {
  return jwt.sign(
    {
      id: user.id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    },
  );
};

export const generateRefreshToken = (user: { id: bigint }) => {
  return jwt.sign(
    {
      id: user.id.toString(),
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "14d",
    },
  );
};

// 2. Google Verify 로직
const googleVerify = async (profile: GoogleProfile) => {
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw new Error("Google 프로필에 이메일이 없습니다.");
  }

  let user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: "GOOGLE_LOGIN_USER",
        name: profile.displayName,
        gender: "MALE",
        birthDate: new Date("1970-01-01"),
        address: "추후 수정",
        phoneNumber: null,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};

// 3. Google Strategy
export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID!,
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET!,
    callbackURL: "/oauth2/callback/google",
    scope: ["email", "profile"],
  },
  async (_accessToken, _refreshToken, profile, cb) => {
    try {
      const user = await googleVerify(profile);

      const tokens = {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
      };

      return cb(null, tokens);
    } catch (err) {
      return cb(err as Error);
    }
  },
);

// Kakao Verify
const kakaoVerify = async (profile: KakaoProfile) => {
  const email = profile._json.kakao_account?.email;
  const name = profile.displayName || "카카오유저";

  if (!email) {
    throw new Error("카카오 계정 이메일이 없습니다.");
  }

  let user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: "KAKAO_LOGIN_USER",
        name: name,
        gender: "MALE",
        birthDate: new Date("1970-01-01"),
        address: "추후 수정",
        phoneNumber: null,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};

// Kakao Strategy
export const kakaoStrategy = new KakaoStrategy(
  {
    clientID: process.env.PASSPORT_KAKAO_CLIENT_ID!,
    clientSecret: process.env.PASSPORT_KAKAO_CLIENT_SECRET!,
    callbackURL: "/oauth2/callback/kakao",
  },
  async (_accessToken, _refreshToken, profile, cb) => {
    try {
      console.log("카카오 프로필:", JSON.stringify(profile._json, null, 2));
      const user = await kakaoVerify(profile);

      const tokens = {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
      };

      return cb(null, tokens);
    } catch (err) {
      console.error("카카오 로그인 에러:", err);
      return cb(err as Error);
    }
  },
);

export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
  },
  async (payload, done) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: BigInt(payload.id),
        },
      });

      return user ? done(null, user) : done(null, false);
    } catch (err) {
      return done(err, false);
    }
  },
);
