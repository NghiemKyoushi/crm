import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { CreateModel } from "@/types/fee-setting";

export const getListInsurance = async () => {
  const res = await api.get(API_TYPE_CONST.INSURANCE_PACKAGE);
  return res.data.data;
};

export const createNewInsurance = async (body: CreateModel) => {
  const res = await api.post(API_TYPE_CONST.INSURANCE_PACKAGE, body);
  return res.data;
};

export const updateInsurance = async (id: number, body: CreateModel) => {
  const res = await api.put(`${API_TYPE_CONST.INSURANCE_PACKAGE}/${id}`, body);
  return res.data;
};

export const deleteInsurance = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.INSURANCE_PACKAGE}/${id}`);
  return res.data;
};

export const getFeeSettingDefault = async () => {
  const res = await api.get(API_TYPE_CONST.FEE_SETTING);
  return res.data.data;
};


export const getFeeShippingDefault = async () => {
    const res = await api.get(API_TYPE_CONST.SHIPPING_METHOD);
    return res.data.data;
  };