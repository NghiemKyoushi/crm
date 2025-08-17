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

export const logout = async () => {
  await api.post(API_TYPE_CONST.LOGOUT);
  // localStorage.removeItem("refreshToken");
  // localStorage.removeItem("accessToken");
  // window.location.href = "/login";
};

export const forgotPassword  = async (email: string) => {  
  const res = await api.post(API_TYPE_CONST.FORGOT_PASSWORD, { email, auth_type: 1 });
  
  return res.data; 
}


export const verifyOtp  = async (email: string, otp: string) => {  
  const res = await api.post(API_TYPE_CONST.VERIFY_OTP, { email, auth_type: 1, otp, phone_number: null });
  
  return res.data; 
}

export const resendOtp  = async (email: string) => {  
  const res = await api.post(API_TYPE_CONST.RESEND_VERIFY_OTP, { email, auth_type: 1 });
  
  return res.data; 
}

export const createNewPassword  = async (email: string,otp: string, new_password: string) => {  
  const res = await api.post(API_TYPE_CONST.CREATE_NEW_PASSWORD, { email, otp , new_password:new_password,  auth_type: 1, phone_number:null });
  
  return res.data; 
}


