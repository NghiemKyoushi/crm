import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { AddWebsiteModel, WebsiteParams } from "@/types/website-manage";

export const getListWebsite = async (params: WebsiteParams) => {
  const res = await api.get(API_TYPE_CONST.WEBSITE_MANAGE, { params });
  return res.data.data;
};

export const createNewWebsite = async (body: AddWebsiteModel) => {
  const res = await api.post(API_TYPE_CONST.WEBSITE_MANAGE, body);
  return res.data;
};

export const updateWebsite = async (id: number, body: AddWebsiteModel) => {
  const res = await api.put(`${API_TYPE_CONST.WEBSITE_MANAGE}/${id}`, body);
  return res.data;
};

export const deleteWebsite = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.WEBSITE_MANAGE}/${id}`);
  return res.data;
};

export const listRegion = async () => {
  const res = await api.get(`${API_TYPE_CONST.LIST_REGION}`);
  return res.data;
};
