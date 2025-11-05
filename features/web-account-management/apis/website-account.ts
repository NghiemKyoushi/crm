import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";

export interface WebsiteAccountPayload {
  website_id: number;
  username: string;
  password: string;
  note?: string;
  account_type: string; // e.g. "AUCTION"
}

export interface WebsiteAccountResponse {
  id: number;
  website_id: number;
  username: string;
  password: string | null;
  note?: string;
  account_type: string;
  delete_flag: number;
  created_at?: string;
  updated_at?: string | null;
}

export const getWebsiteAccounts = async (websiteId: number) => {
  const res = await api.get(`${API_TYPE_CONST.WEBSITE_ACCOUNT}/${websiteId}`);
  return res.data?.data as WebsiteAccountResponse[];
};

export const createWebsiteAccount = async (payload: WebsiteAccountPayload) => {
  const res = await api.post(API_TYPE_CONST.WEBSITE_ACCOUNT, payload);
  return res.data;
};

export const updateWebsiteAccount = async (
  id: number,
  payload: WebsiteAccountPayload
) => {
  const res = await api.put(`${API_TYPE_CONST.WEBSITE_ACCOUNT}/${id}`, payload);
  return res.data;
};

export const deleteWebsiteAccount = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.WEBSITE_ACCOUNT}/${id}`);
  return res.data;
};


