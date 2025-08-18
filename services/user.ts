import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { UserProfile } from "@/types/user";

export const getUserProfile = async (): Promise<UserProfile> => {
  const res = await api.get(API_TYPE_CONST.GET_PROFILE);
  return res.data.data;
};

export const updateUserProfile = async (param: UserProfile) => {
  const body= {
    full_name: param.full_name,
    email:param.email,
    phone_number: '0123456789',
    birthday:'12122222',
  }
  console.log('body', body);

  const res = await api.put(API_TYPE_CONST.GET_PROFILE, body);
  return res.data.data;
};

export const updatePassword = async (body: UserProfile) => {
    const res = await api.put(API_TYPE_CONST.GET_PROFILE, body);
    return res.data.data;
};

