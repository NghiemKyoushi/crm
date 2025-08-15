import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";

export const loginRequest  = async (email: string, password: string) => {
    console.log('check3333444',API_TYPE_CONST);
    
  const res = await api.post(API_TYPE_CONST.LOGIN, { email, password });  
  const { refreshToken } = res.data;

  if (!refreshToken) {
    throw new Error("Không nhận được refreshToken từ API");
  }
  localStorage.setItem("refreshToken", refreshToken);

  const tokenRes = await api.post(API_TYPE_CONST.GENERATE_ACCESS_TOKEN, { refreshToken });
  const { accessToken } = tokenRes.data;

  if (!accessToken) {
    throw new Error("Không nhận được accessToken từ API");
  }
  localStorage.setItem("accessToken", accessToken);
  return { refreshToken, accessToken };
};

export const logout = () => {
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
};

