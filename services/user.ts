import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { Password, UserProfile } from "@/types/user";

export const getUserProfile = async (): Promise<UserProfile> => {
  const res = await api.get(API_TYPE_CONST.GET_PROFILE);
  return res.data.data;
};

export const updateUserProfile = async (param: UserProfile) => {
  const body = {
    full_name: param.full_name,
    email: param.email,
    phone_number: null,
    birthday: null,
  };
  console.log("body", body);

  const res = await api.put(API_TYPE_CONST.GET_PROFILE, body);
  return res.data.data;
};

export const updatePassword = async (params: Password) => {
  const res = await api.put(API_TYPE_CONST.CHANGE_PASSWORD, params);
  return res.data.data;
};
