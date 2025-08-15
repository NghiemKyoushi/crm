import { LoginParams, LoginResponse } from '@/features/login/types';
import { apiPublic } from '@/lib/api-client';

export const postLogin = async (body: LoginParams): Promise<LoginResponse> => {
  return await apiPublic.post('', body);
};
