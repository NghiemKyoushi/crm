import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { getListMasterialParams, MaterialTransactionRequest } from "@/types/partner";
import { AddWebsiteModel } from "@/types/website-manage";

export const getListMaterial = async (params: getListMasterialParams) => {
  const res = await api.get(API_TYPE_CONST.MATERIAL_TRANSACTIONS , { params });
  return res.data.data;
};

export const getMaterialSumary = async () => {
  const res = await api.get(API_TYPE_CONST.MATERIAL_TRANSACTIONS_SUMARY);
  return res.data.data;
};

export const createNewMaterial = async (body: MaterialTransactionRequest) => {
  const res = await api.post(API_TYPE_CONST.MATERIAL_TRANSACTIONS, body);
  return res.data;
};

export const updateMaterial = async (id: number, body: AddWebsiteModel) => {
  const res = await api.put(`${API_TYPE_CONST.MATERIAL_TRANSACTIONS}/${id}`, body);
  return res.data;
};

export const deleteMaterial = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.MATERIAL_TRANSACTIONS}/${id}`);
  return res.data;
};
