import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { UpdateListRateParams, UpdateListRateParamsCheck } from "@/types/setting";

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

export const updateListExchangRateCategory = async (params: UpdateListRateParamsCheck) => {
  const res = await api.post(`${API_TYPE_CONST.UPDATE_EXCHANGE_RATE}`, params);
  return res.data.data;
};

export const getTelegramSetting = async () => {
  const res = await api.get(`${API_TYPE_CONST.SETTING_TELEGRAM}?key=TELEGRAM`);
  return res.data.data;
};
export const setTelegramSetting = async (telegram: string) => {
  const res = await api.post(API_TYPE_CONST.SETTING_TELEGRAM, { telegram });
  return res.data.data;
};
