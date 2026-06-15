import { prisma } from "../../../db.config.js";
import { UserUpdateRequest } from "../dtos/user.dto.js";

// User 데이터 삽입
export const addUser = async (data: any): Promise<number | null> => {
  // 1. 이미 존재하는 이메일인지 확인
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (user) {
    return null;
  }

  const { email, password, name, gender, birthDate, address, phoneNumber } =
    data;

  // 2. 새로운 유저 생성
  const created = await prisma.user.create({
    data: {
      email,
      password,
      name,
      gender: gender ?? null,
      birthDate: new Date(birthDate),
      address: address ?? "",
      phoneNumber: phoneNumber ?? null,
    },
  });

  return Number(created.id);
};

// 사용자 정보 얻기
export const getUser = async (userId: number) => {
  return await prisma.user.findUniqueOrThrow({ where: { id: userId } });
};

// 음식 선호 카테고리 매핑
export const setPreference = async (userId: number, foodId: number) => {
  await prisma.userFoodCategory.create({
    data: {
      userId,
      foodId,
    },
  });
};

// 사용자 선호 카테고리 반환
export const getUserPreferencesByUserId = async (userId: number) => {
  return await prisma.userFoodCategory.findMany({
    where: { userId: userId },
    include: {
      food: true, // 핵심: JOIN 대신 include를 써서 연관 데이터를 가져옵니다!
    },
    orderBy: { foodId: "asc" },
  });
};

export const updateUser = async (userId: number, data: UserUpdateRequest) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};
