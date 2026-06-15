import { prisma } from "../../../db.config.js";

export const addUserMission = async (userId: number, missionId: number) => {
  const created = await prisma.userMission.create({
    data: {
      userId,
      missionId,
      status: 0, // 0: 진행중, 1: 완료
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return created;
};

// 미션 존재 확인
export const getMissionById = async (missionId: number) => {
  return await prisma.mission.findFirst({
    where: { id: missionId },
  });
};

// 이미 도전 중인 미션인지 확인
export const getUserMissionByMissionId = async (
  userId: number,
  missionId: number,
) => {
  return await prisma.userMission.findFirst({
    where: {
      userId: userId,
      missionId: missionId,
    },
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

export const updateUserMissionStatus = async (
  userId: number,
  missionId: number,
) => {
  return await prisma.userMission.updateMany({
    where: {
      userId,
      missionId,
      status: 0, // 진행중인 것만 완료로 변경 가능
    },
    data: {
      status: 1,
    },
  });
};
