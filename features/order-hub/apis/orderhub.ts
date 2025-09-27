import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  ApproveOrderModel,
  OrderFeeRequest,
  RateOrderRequest,
  TrackingWeightInfo,
} from "@/types/orderhub";

export const getListOrder = async (params: {
  page: number;
  size: number;
  status?: string;
}) => {
  const res = await api.get(API_TYPE_CONST.LIST_ORDER, { params });
  return res.data.data;
};

export const getDetailOrder = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.DETAIL_ORDER}/${id}`);
  return res.data.data;
};

export const getDataProductFromLink = async (link: string) => {
  const res = await api.post(API_TYPE_CONST.GET_DATA_FROM_LINK, { url: link });
  return res.data.data;
};

export const getListService = async () => {
  const res = await api.get(API_TYPE_CONST.FEE_GET);
  return res.data.data;
};

export const getRateOrder = async (params: {
  userId: string;
  productId: number;
}) => {
  const res = await api.get(API_TYPE_CONST.EXCHANGE_RATE, { params });
  return res.data.data;
};

export const getDataFeeService = async (body: RateOrderRequest) => {
  const res = await api.post(API_TYPE_CONST.CALCULATE_FEE, body);
  return res.data.data;
};

export const createOrder = async (body: OrderFeeRequest) => {
  const res = await api.post(API_TYPE_CONST.CREATE_ORDER, body);
  return res.data.data;
};

export const aproveOrder = async (id: string, body: ApproveOrderModel) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/confirm/${id}`,
    body
  );
  return res.data.data;
};

export const cancelOrder = async (id: string, reason: string) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/reject-order/${id}`,
    { reason }
  );
  return res.data.data;
};

export const confirmPurchaeOrder = async (id: string) => {
  const res = await api.put(`${API_TYPE_CONST.CREATE_ORDER}/purchased/${id}`);
  return res.data.data;
};

export const trackingToJp = async (id: string, tracking: string) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/arrived-jp-warehouse/${id}`,
    { tracking_code: tracking }
  );
  return res.data.data;
};

export const trackingToVn = async (id: string, image_ids: Array<number>) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/arrived-vn-warehouse/${id}`,
    { image_ids }
  );
  return res.data.data;
};

export const checkOrder = async (id: string, body: TrackingWeightInfo) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/under-inspection/${id}`,
    body
  );
  return res.data.data;
};

export const completeOrder = async (id: string) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/complete-shipping/${id}`
  );
  return res.data.data;
};
