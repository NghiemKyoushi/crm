const AUTH_PREFIX = "users/v1/auth";
const ONBOARD = "users/v1/onboard";

export const API_TYPE_CONST = {
  LOGIN: `${AUTH_PREFIX}/login`,
  LOGOUT: `${AUTH_PREFIX}/logout`,
  GENERATE_ACCESS_TOKEN: `${AUTH_PREFIX}/generate/access-token`,
  FORGOT_PASSWORD: `${ONBOARD}/forgot-password`,
  VERIFY_OTP: `${ONBOARD}/verify-otp`,
  RESEND_VERIFY_OTP: `${ONBOARD}/resend-verify-otp`,
  CREATE_NEW_PASSWORD: `${ONBOARD}/create-new-password`,
} as const;