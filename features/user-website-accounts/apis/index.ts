import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";

export interface UserWebsiteAccountItem {
  id: number;
  username: string;
  account_type: string;
  website_name: string;
  note?: string;
  created_at?: string;
}

export const getUserWebsiteAccounts = async (userId: number) => {
  const res = await api.get(`${API_TYPE_CONST.USER_WEBSITE_ACCOUNTS}/${userId}`);
  return res.data?.data as UserWebsiteAccountItem[];
};

export const getUserWebsiteAccountCount = async (userId: number) => {
  const data = await getUserWebsiteAccounts(userId);
  return data?.length || 0;
};

export const assignUserWebsiteAccounts = async (
  userId: number,
  accountIds: number[]
) => {
  const res = await api.put(
    `${API_TYPE_CONST.USER_WEBSITE_ACCOUNTS}/${userId}`,
    { account_ids: accountIds }
  );
  return res.data;
};


