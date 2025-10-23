import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  AddWebsiteModel,
  WebsiteParams,
  UpdateSelectorConfigRequest,
  TestSelectorConfigRequest,
  TestSelectorConfigResponse
} from "@/types/website-manage";

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

export const listRoute = async () => {
  const res = await api.get(`${API_TYPE_CONST.SHIP_ROUTE}`);
  return res.data;
};

export const updateSelectorConfig = async (
  id: number,
  body: UpdateSelectorConfigRequest
) => {
  const res = await api.put(
    `${API_TYPE_CONST.UPDATE_SELECTOR_CONFIG}/${id}/selector-config`,
    body
  );
  return res.data;
};

export const testSelectorConfig = async (
  body: TestSelectorConfigRequest
) => {
  const res = await api.post<{ data: TestSelectorConfigResponse }>(
    API_TYPE_CONST.TEST_SELECTOR_CONFIG,
    body
  );
  return res.data.data;
};
