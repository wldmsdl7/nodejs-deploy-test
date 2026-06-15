import {
  responseFromUser,
  UserSignUpRequest,
  UserUpdateRequest,
  responseFromUpdatedUser,
} from "../dtos/user.dto.js"; //인터페이스 가져오기

import {
  addUser,
  getUser,
  getUserPreferencesByUserId,
  setPreference,
  updateUser,
} from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import { DuplicateUserEmailError } from "../../../common/customError.js";

export const userSignUp = async (data: UserSignUpRequest) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const joinUserId = await addUser({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    gender: data.gender,
    birthDate: new Date(data.birthDate),
    address: data.address,
    phoneNumber: data.phoneNumber,
  });

  // 이메일 중복
  if (joinUserId === null) {
    throw new DuplicateUserEmailError(data);
  }

  for (const preference of data.preferences) {
    await setPreference(joinUserId, preference);
  }

  const user = await getUser(joinUserId);
  const preferences = await getUserPreferencesByUserId(joinUserId);

  return responseFromUser({ user, preferences });
};

export const updateUserInfo = async (
  userId: number,
  data: UserUpdateRequest,
) => {
  const { name, address, phoneNumber } = data;

  const updated = await updateUser(userId, {
    ...(name !== undefined && { name }),
    ...(address !== undefined && { address }),
    ...(phoneNumber !== undefined && { phoneNumber }),
  });

  return responseFromUpdatedUser(updated);
};
