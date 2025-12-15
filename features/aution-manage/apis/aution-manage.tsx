import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { AutionParams } from "../types/aution-manage";

export const fetchAuctionLinks = (params?: AutionParams) => {
  return api.get(API_TYPE_CONST.AUTION_LINKS, { params });
};
export const fetchAuctionCustomers = (params?: any) => {
  return api.get(API_TYPE_CONST.AUTION_CUSTOMERS, { params });
};

export const fetchAuctionResultTab = async (params?: any) => {
  const response = await api.get(API_TYPE_CONST.AUTION_RESULT_TAB, { params });
  return response?.data?.data;
};
export const fetchAuctionVipCustomers = async (params?: any) => {
  const response = await api.get(API_TYPE_CONST.AUTION_VIP_CUSTOMER, {
    params,
  });
  return response?.data?.data;
};
export const fetchAuctionSettings = async () => {
  const response = await api.get(API_TYPE_CONST.AUTION_SETTINGS);
  return response?.data?.data;
};
export const fetchListViolate = async (params?: any) => {
  const response = await api.get(API_TYPE_CONST.AUTION_LIST_VIOLATE, {
    params,
  });
  return response?.data?.data;
};
export const fetchAuctionViolate = async (params?: any) => {
  const response = await api.get(API_TYPE_CONST.AUTION_SUMMARY, { params });
  return response?.data?.data;
};

export const deleteAuctionViolate = async (penaltyId: number) => {
  const url = `${API_TYPE_CONST.AUTION_DELETE_VIOLATE}/${penaltyId}`;
  return api.delete(url);
};
// API lấy thông tin cài đặt
export const getAuctionSettings = async () => {
  const response = await api.get(API_TYPE_CONST.AUTION_SETTINGS);
  return response?.data?.data;
};

// API cập nhật cài đặt
export const updateAuctionSettings = async (body: { live_safe_seconds: number; max_violation_count: number }) => {
  const response = await api.put(API_TYPE_CONST.AUTION_SETTINGS, body);
  return response?.data?.data;
};

// API tạo đơn hàng từ bid
export const createAuctionOrder = (auctionId: string, payload?: any) => {
  const url = API_TYPE_CONST.AUTION_CREATE_ORDER.replace("{id}", auctionId);
  return api.post(url, payload);
};

// API cập nhật BOM của bid
export const updateAuctionBOM = (bidId: string | number, payload?: any) => {
  const url = API_TYPE_CONST.AUTION_BOM.replace("{bidId}", String(bidId));
  return api.put(url, payload);
};


// Yêu cầu duyệt đơn đấu giá (approve)
export const approveAuction = (
  auctionId: string,
  payload?: { activateIfScheduled: boolean }
) => {
  const url = API_TYPE_CONST.AUTION_APPROVE.replace("{id}", auctionId);
  return api.put(url, payload);
};

export const blockOrUnblockAuctionVipCustomer = async (
  userId: string | number,
  blocked: boolean
) => {
  const url = API_TYPE_CONST.AUTION_BLOCK.replace("{userId}", String(userId));
  return await api.put(`${url}?blocked=${blocked}`);
};

export const excuteAuction = (
  auctionId: string,
  payload?: { success: boolean }
) => {
  const url = API_TYPE_CONST.AUTION_EXCUTE_PENDING.replace(
    "{bidId}",
    auctionId
  );
  const params = { success: payload?.success };
  return api.put(url, undefined, { params });
};

// Từ chối đơn đấu giá (reject pending)
export const rejectAuction = (auctionId: string, payload?: any) => {
  const url = API_TYPE_CONST.AUTION_REJECT.replace("{bidId}", auctionId);
  return api.put(url, payload);
};

// Hoàn tất/Chốt phiên đấu giá (finalize)
export const finalizeAuction = (auctionId: string, payload?: any) => {
  const url = API_TYPE_CONST.AUTION_FINAL.replace("{id}", auctionId);
  return api.post(url, payload);
};

// Admin hủy phiên đấu giá (admin-cancel)
export const adminCancelAuction = (auctionId: string, payload?: any) => {
  const url = API_TYPE_CONST.AUTION_CANCEL.replace("{id}", auctionId);
  return api.post(url, payload);
};
