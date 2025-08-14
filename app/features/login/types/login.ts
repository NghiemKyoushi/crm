import { User } from "@/types/user";

export type LoginParams = {
  api: string;
  email: string;
  pwd: string;
  device_type: number;
  notify_token: string;
  device_id: string;
  application_version: string;
  application: string;
  applicaton_type: number;
  login_time: string;
  allow_send_gift: boolean;
  language: string;
  use_fcm: boolean;
};

export type LoginResponse = {
  code: number;
  data?: User;
};

export type GetUserParams = {
  api: string;
  token: string;
  req_user_id?: string;
};
