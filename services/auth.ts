import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import axios from "axios";
import Cookies from "js-cookie";


const apiAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
  withCredentials: true,
  headers: {
    "Accept-Language": "vn",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "X-Platform": "1",
    "X-Device-Id": "dev-1",
    "X-Device-Name": "TestDevice",
    "X-Os-Version": "14",
    "X-Os": "Android",
    "X-Ip": "127.0.0.1",
    "X-Location": "HN",
  },
});
export const loginRequest = async (email: string, password: string) => {
  const res = await apiAuth.post(API_TYPE_CONST.LOGIN, { email, password, auth_type: 1 });
  const refreshToken = res.data.data.refresh_token;

  if (!refreshToken) {
    throw new Error("No refresh token received from API");
  }

  Cookies.set("refreshToken", refreshToken, {
    expires: 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const accessToken = await api.post(
    API_TYPE_CONST.GENERATE_ACCESS_TOKEN,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  const token = accessToken.data.data.token;

  Cookies.set("token", token, {
    expires: 1,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { refreshToken, accessToken: token };
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


