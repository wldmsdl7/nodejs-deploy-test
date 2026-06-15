import {
  responseFromCompletedMission,
  responseFromUserMission,
} from "../dtos/mission.dto.js";
import {
  addUserMission,
  getMissionById,
  getUserMissionByMissionId,
  updateUserMissionStatus,
} from "../repositories/mission.repository.js";
import {
  AlreadyChallengingMissionError,
  AlreadyCompletedMissionError,
  MissionNotFoundError,
  UserMissionNotFoundError,
} from "../../../common/customError.js";

export const createChallangeMission = async (
  userId: number,
  missionId: number,
) => {
  // 미션 존재 확인
  const mission = await getMissionById(missionId);

  if (!mission) {
    throw new MissionNotFoundError();
  }

  // 이미 도전 중인 미션인지 확인
  const existingMission = await getUserMissionByMissionId(userId, missionId);

  if (existingMission) {
    throw new AlreadyChallengingMissionError();
  }

  // 생성
  const userMission = await addUserMission(userId, missionId);

  return responseFromUserMission({
    id: Number(userMission.id),
    createdAt: userMission.createdAt.toISOString(),
    updatedAt: userMission.updatedAt.toISOString(),
  });
};

export const completeUserMission = async (
  userId: number,
  missionId: number,
) => {
  const existing = await getUserMissionByMissionId(userId, missionId);

  // 존재 여부 확인
  if (!existing) {
    throw new UserMissionNotFoundError();
  }

  // 이미 완료된 경우
  if (existing.status === 1) {
    throw new AlreadyCompletedMissionError();
  }

  await updateUserMissionStatus(userId, missionId);

  const result = responseFromCompletedMission(missionId);

  return result;
};
