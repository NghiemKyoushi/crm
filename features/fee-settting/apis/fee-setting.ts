import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { CategoryItem, CreateModel, FormData, ItemShippingList, MaterialResponse, MaterialResponseArray, ShippingConditionParams } from "@/types/fee-setting";
import { WebsiteParams } from "@/types/website-manage";

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

export const updateFeeSettingDefault = async (body: FormData) => {
  const res = await api.put(API_TYPE_CONST.FEE_SETTING, body);
  return res.data.data;
};

export const getFeeShippingDefault = async () => {
  const res = await api.get(API_TYPE_CONST.SHIPPING_METHOD);
  return res.data.data;
};

export const updateFeeShippingDefault = async (body: ItemShippingList) => {
  const res = await api.put(API_TYPE_CONST.SHIPPING_METHOD, body);
  return res.data.data;
};

export const getListProductCategory = async () => {
  const res = await api.get(API_TYPE_CONST.PRODUCT_CATEGORIES);
  return res.data.data;
};

export const getMaterial = async (): Promise<MaterialResponseArray> => {
  const res = await api.get(API_TYPE_CONST.PRODUCT_FEE);
  return res.data.data;
};

export const updateShippingFee = async (body: ShippingConditionParams) => {
  const res = await api.post(API_TYPE_CONST.PRODUCT_FEE, body);
  return res.data.data;
};


export const getListProductType = async (params: WebsiteParams) => {
  const res = await api.get(API_TYPE_CONST.PRODUCT_CATEGORIES, { params });
  return res.data;
};

export const createNewProductType = async (body: CategoryItem) => {  
  const res = await api.post(API_TYPE_CONST.PRODUCT_CATEGORIES, body);
  return res.data;
};

export const updateProductType = async (id: number, body: CategoryItem) => {
  const res = await api.put(`${API_TYPE_CONST.PRODUCT_CATEGORIES}/${id}`, body);
  return res.data;
};

export const deleteProductType = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.PRODUCT_CATEGORIES}/${id}`);
  return res.data;
};
