import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { OrderFeeRequest, RateOrderRequest } from "@/types/orderhub";

export const getListOrder = async (params: { page: number; size: number }) => {
  const res = await api.get(API_TYPE_CONST.LIST_ORDER, { params });
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
