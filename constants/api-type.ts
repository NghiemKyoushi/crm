const AUTH_PREFIX = "users/v1/auth";
const ONBOARD = "users/v1/onboard";
const PROFILE ="users/v1/profile";
const MEDIA="medias/v1/files";
export const VIEW_IMAGE="medias/v1/files/view/thumb/"
export const API_TYPE_CONST = {
  LOGIN: `${AUTH_PREFIX}/login`,
  LOGOUT: `${AUTH_PREFIX}/logout`,
  GENERATE_ACCESS_TOKEN: `${AUTH_PREFIX}/generate/access-token`,
  FORGOT_PASSWORD: `${ONBOARD}/forgot-password`,
  VERIFY_OTP: `${ONBOARD}/verify-otp`,
  RESEND_VERIFY_OTP: `${ONBOARD}/resend-verify-otp`,
  CREATE_NEW_PASSWORD: `${ONBOARD}/create-new-password`,
  GET_PROFILE: `${PROFILE}/me`,
  UPDATE_AVARTAR: `/users/v1/profile/me/avatar`,
  CHANGE_PASSWORD:`/users/v1/users/change-password`,
  UPLOAD_IMAGE:`${MEDIA}/upload`,
  
} as const;