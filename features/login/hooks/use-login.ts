import { createNewPassword, forgotPassword, loginRequest, resendOtp, verifyOtp } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({ email }: { email: string}) =>
      forgotPassword(email),
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string, otp: string}) =>
      verifyOtp(email, otp),
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: ({ email }: { email: string}) =>
      resendOtp(email),
  });
};

export const useCreateNewPassword = () => {
  return useMutation({
    mutationFn: ({ email , otp, new_password}: { email: string, otp:string, new_password: string}) =>
      createNewPassword(email, otp, new_password),
  });
};