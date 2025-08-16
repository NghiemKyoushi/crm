import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";

export const loginRequest  = async (email: string, password: string) => {    
  const res = await api.post(API_TYPE_CONST.LOGIN, { email, password, auth_type: 1 });
  const refreshToken = res.data.data.refresh_token;
  if (!refreshToken) {
    throw new Error("Không nhận được refreshToken từ API");
  }

  localStorage.setItem("refreshToken", refreshToken);
  const accessToken = await api.post(
    API_TYPE_CONST.GENERATE_ACCESS_TOKEN,
    {}, 
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );  
  localStorage.setItem("accessToken", accessToken.data.data.token);
  return { refreshToken, accessToken };
};

export const logout = () => {
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
};

