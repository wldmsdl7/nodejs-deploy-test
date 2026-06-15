export interface UserMissionResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export const responseFromUserMission = (
  mission: UserMissionResponse,
): UserMissionResponse => {
  return {
    id: mission.id,
    createdAt: mission.createdAt,
    updatedAt: mission.updatedAt,
  };
};

export interface CompleteUserMissionResponse {
  missionId: number;
  isCompleted: boolean;
}

export const responseFromCompletedMission = (
  missionId: number,
): CompleteUserMissionResponse => {
  return {
    missionId,
    isCompleted: true,
  };
};
