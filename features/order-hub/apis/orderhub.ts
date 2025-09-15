import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";

export const getListOrder = async (params: {page: number, size: number}) => {
  const res = await api.get(API_TYPE_CONST.LIST_ORDER, { params });
  return res.data.data;
};