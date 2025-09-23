import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { ParamCreateSurchangeModel } from "@/types/surchange";

export const getListSurchange = async () => {
  const res = await api.get(API_TYPE_CONST.SURCHANGE_SETTING);
  return res.data.data;
};

export const createNewSurchange = async (body: ParamCreateSurchangeModel) => {
  const res = await api.post(API_TYPE_CONST.SURCHANGE_SETTING, body);
  return res.data;
};

export const updateSurchange= async (id: number, body: ParamCreateSurchangeModel) => {
  const res = await api.put(`${API_TYPE_CONST.SURCHANGE_SETTING}/${id}`, body);
  return res.data;
};

export const deleteSurchange = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.SURCHANGE_SETTING}/${id}`);
  return res.data;
};