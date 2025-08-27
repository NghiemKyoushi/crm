import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { RoleDetail } from "@/features/user-profile/components/user-profile-form";
import { RoleRequest } from "@/types/roles";
import { Password, UserProfile } from "@/types/user";

export const getUserProfile = async (): Promise<UserProfile> => {
  const res = await api.get(API_TYPE_CONST.GET_PROFILE);
  return res.data.data;
};

export const getUserRole = async (): Promise<RoleDetail> => {
  const res = await api.get(API_TYPE_CONST.ROLE_USER);
  return res.data.data;
};


export const updateUserProfile = async (param: UserProfile) => {
  const body = {
    full_name: param.full_name,
    email: param.email,
    phone_number: param.phone_number,
    birthday: param.birthday,
  };

  const res = await api.put(API_TYPE_CONST.GET_PROFILE, body);
  return res.data.data;
};

export const updatePassword = async (params: Password) => {
  const res = await api.put(API_TYPE_CONST.CHANGE_PASSWORD, params);
  return res.data.data;
};
