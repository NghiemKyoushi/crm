import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { DashboardResponse } from "../types/dashboard";

export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await api.get(API_TYPE_CONST.DASHBOARD_STATS);
  return response.data;
};
