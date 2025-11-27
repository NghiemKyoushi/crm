import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { FeeData } from "@/features/fee-settting/components/shipping-service-form";
import { ServiceFee } from "@/types/fee-setting";
import {
  ApproveOrderModel,
  CreateTrackingModel,
  OrderFeeRequest,
  RateOrderRequest,
  TrackingWeightInfo,
  updateCodEachRowModel,
} from "@/types/orderhub";
import qs from "qs";
import { FilterType } from "../components/order-hub-filter";
import { FilterTypeShipment } from "@/features/shipment-management/components/shipment-filter";

export const getListOrder = async (
  params: FilterType
  //   {
  //   page: number;
  //   size: number;
  //   status?: string;
  //   search?: string;
  //   date?: string;
  //   type?:number;
  // }
) => {
  const res = await api.get(API_TYPE_CONST.LIST_ORDER, {
    params,
    paramsSerializer: (params) =>
      new URLSearchParams(
        Object.entries(params).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
        )
      ).toString(),
  });
  return res.data.data;
};

export const getListOrderTracking = async (params: FilterTypeShipment) => {
  const res = await api.get(API_TYPE_CONST.GET_TRACKING_ORDER, {
    params,
    paramsSerializer: (params) =>
      new URLSearchParams(
        Object.entries(params).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
        )
      ).toString(),
  });

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

export const getListService = async (params: { routeId: number }) => {
  const res = await api.get(API_TYPE_CONST.FEE_GET, { params });
  return res.data.data;
};

export const getListServiceAdmin = async (params: {
  userId?: number;
  routeId?: number;
}) => {
  const res = await api.get(API_TYPE_CONST.FEE_GET_ADMIN, { params });
  return res.data.data;
};

export const updateListService = async (body: FeeData) => {
  const res = await api.post(API_TYPE_CONST.FEE_GET, body);
  return res.data.data;
};

export const getRateOrder = async (params: {
  userId: string;
  productId: number;
  order_id?: number;
}) => {
  const res = await api.get(API_TYPE_CONST.EXCHANGE_RATE, { params });
  return res.data.data;
};

export const getRateExchanges = async (params: { userId: string }) => {
  const res = await api.get(`${API_TYPE_CONST.GET_DATA_LIST}`, { params });
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

export const updateOrder = async (id: number, body: OrderFeeRequest) => {
  const res = await api.put(`${API_TYPE_CONST.CREATE_ORDER}/edit/${id}`, body);
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

export const trackingToJp = async (id: string) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/arrived-jp-warehouse/${id}`
    // { tracking_code: tracking }
  );
  return res.data.data;
};

export const trackingToVn = async (
  id: string,
  body: {
    image_ids?: Array<number>;
    is_repacked?: boolean;
    count_verify?: number;
  }
) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_ORDER}/arrived-vn-warehouse/${id}`,
    body
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

export const completeShippingOrder = async (body: {
  shipping_code: string;
  shipping_type?: number;
  shipping_fee?: number;
  shipping_tracking?: string;
}) => {
  const res = await api.put(`${API_TYPE_CONST.COMPLETE_SHIPPING}`, body);
  return res.data.data;
};

export const getDataWeight = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.GET_INFO_WEIGHT}/${id}`);
  return res.data.data;
};

export const updateNoteOrder = async (
  order_id: number,
  body: { note: string }
) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_PRIVATE_NOTE}/${order_id}`,
    body
  );
  return res.data.data;
};

export const updateNoteOrderClient = async (
  id: number,
  params: { note: string }
) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_PRIVATE_NOTE_CLIENT}/${id}`,
    params
  );
  return res.data.data;
};

export const createTrackingOrder = async (
  id: number,
  body: CreateTrackingModel
) => {
  const res = await api.post(
    `${API_TYPE_CONST.CREATE_TRACKING_ORDER}/${id}`,
    body
  );
  return res.data.data;
};

export const updateTrackingOrder = async (
  id: number,
  body: CreateTrackingModel[]
) => {
  const res = await api.put(
    `${API_TYPE_CONST.CREATE_TRACKING_ORDER}/${id}`,
    body
  );
  return res.data.data;
};

export const getTrackingOrder = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.CREATE_TRACKING_ORDER}/${id}`);
  return res.data.data;
};

export const genPackageCode = async () => {
  const res = await api.get(API_TYPE_CONST.GEN_PACKAGE_CODE);
  return res.data.data;
};

export const updateCodForEarchOrder = async (
  id: number,
  body: updateCodEachRowModel
) => {
  const res = await api.post(
    `${API_TYPE_CONST.UPDATE_COD_EACH_ROW}/${id}`,
    body
  );
  return res.data.data;
};

export const getDataGeneral = async (params?: { customerGroupId?: number }) => {
  const res = await api.get(API_TYPE_CONST.GET_DATA_CHECK, { params });
  return res.data.data;
};

export const updateKuponOrder = async (id: number, body: { kupon: number }) => {
  const res = await api.put(`${API_TYPE_CONST.UPDATE_KUPON}/${id}`, body);
  return res.data.data;
};

export const updateStatusPackaged = async (body: { shipping_code: string }) => {
  const res = await api.put(`${API_TYPE_CONST.TRACKING_PACKAGED}`, body);
  return res.data.data;
};

// Get source website by domain search
export const getSourceWebsiteByDomain = async (domain: string) => {
  const res = await api.get(API_TYPE_CONST.WEBSITE_MANAGE, {
    params: {
      page: 0,
      size: 20,
      search: domain,
    },
  });
  return res.data.data;
};

// Get website accounts by website ID
export const getWebsiteAccounts = async (websiteId: number) => {
  const res = await api.get(
    `${API_TYPE_CONST.GET_WEBSITE_ACCOUNTS}/${websiteId}`
  );
  return res.data.data;
};

// Update order source account
export const updateOrderSourceAccount = async (
  orderId: number,
  sourceAccountId: number
) => {
  const res = await api.put(
    `${API_TYPE_CONST.ORDER_SOURCE_ACCOUNT}/${orderId}`,
    {
      sourceAccountId,
    }
  );
  return res.data.data;
};

export const cancelOrderAfterApprove = async (
  id: number,
  body: {
    amount: number;
    note: string;
    isFullBack: boolean;
  }
) => {
  const bodySend = {
    note: body.note,
    is_full_back: body.isFullBack,
    amount: body.amount
  }
  const res = await api.post(`${API_TYPE_CONST.CANCEL_ORDER}/${id}`, bodySend);
  return res.data.data;
};

export const getOrderHistory = async (orderId: number) => {
  const res = await api.get(`${API_TYPE_CONST.ORDER_HISTORY}${orderId}`);
  return res.data.data;
};

