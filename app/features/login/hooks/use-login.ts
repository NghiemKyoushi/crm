import { postLogin } from "@/features/login/apis";
import { LoginParams, LoginResponse } from "@/features/login/types";
import { UseBaseMutationResult, useMutation } from "@tanstack/react-query";

export const useLoginMutation = (): UseBaseMutationResult<
  LoginResponse,
  Error,
  LoginParams,
  unknown
> =>
  useMutation<LoginResponse, Error, LoginParams>({
    mutationFn: postLogin,
  });
