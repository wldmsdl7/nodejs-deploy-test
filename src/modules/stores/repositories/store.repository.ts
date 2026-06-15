import { prisma } from "../../../db.config.js";
import { CreateStoreRequest } from "../dtos/store.dto.js";

// 가게 생성
export const addStore = async (data: CreateStoreRequest) => {
  const { name, storeType, regionId } = data;
  return await prisma.store.create({
    data: {
      name,
      storeType,
      regionId,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// 지역 존재 확인
export const getRegionById = async (regionId: number) => {
  return await prisma.region.findFirst({
    where: { id: regionId },
  });
};

export const getMissionsByStore = async (
  storeId: number,
  cursor: number,
  limit: number,
) => {
  const missions = await prisma.mission.findMany({
    where: {
      storeId,
      ...(cursor && {
        id: {
          gt: cursor,
        },
      }),
    },
    select: {
      id: true,
      description: true,
      rewardPoint: true,
      expireDate: true,
      store: {
        select: {
          name: true,
          storeType: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
    take: limit + 1,
  });

  const hasNext = missions.length > limit;

  return {
    missions: hasNext ? missions.slice(0, limit) : missions,
    hasNext,
  };
};

// totalPages 계산
export const countmissionsByStore = async (storeId: number) => {
  return await prisma.mission.count({
    where: {
      storeId,
    },
  });
};
