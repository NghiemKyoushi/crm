import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { UpdateListRateParams } from "@/types/setting";

export const getListExchangRate = async () => {
  const res = await api.get(API_TYPE_CONST.LIST_EXCHANGE_RATE);
  return res.data.data;
};

export const getListExchangRateEachCategory = async (customerGroupId: number) => {
  const res = await api.get(API_TYPE_CONST.LIST_EXCHANGE_RATE, {
    params: { customerGroupId }, 
  });
  return res.data.data;
};

export const updateListExchangRate = async (params: UpdateListRateParams) => {
  const res = await api.put(API_TYPE_CONST.UPDATE_EXCHANGE_RATE, params.data);
  return res.data.data;
};

export const updateListExchangRateCategory = async (customerGroupId: string, params: UpdateListRateParams) => {
  const res = await api.put(`${API_TYPE_CONST.UPDATE_EXCHANGE_RATE}/${customerGroupId}`, params.data);
  return res.data.data;
};
