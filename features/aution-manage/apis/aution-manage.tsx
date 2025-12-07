import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { AutionParams } from "../types/aution-manage";

export const fetchAuctionLinks = (params?: AutionParams) => {
  return api.get(API_TYPE_CONST.AUTION_LINKS, { params });
};
export const fetchAuctionCustomers = (params?: any) => {
  return api.get(API_TYPE_CONST.AUTION_CUSTOMERS, { params });
};

// Yêu cầu duyệt đơn đấu giá (approve)
export const approveAuction = (
  auctionId: string,
  payload?: { activateIfScheduled: boolean }
) => {
  const url = API_TYPE_CONST.AUTION_APPROVE.replace("{id}", auctionId);
  return api.post(url, payload);
};

export const excuteAuction = (
  auctionId: string,
  payload?: { pending_bid_id: number; placed_price: number }
) => {
  const url = API_TYPE_CONST.AUTION_EXCUTE_PENDING.replace("{auctionId}", auctionId);
  return api.post(url, payload);
};

// Từ chối đơn đấu giá (reject pending)
export const rejectAuction = (auctionId: string, payload?: any) => {
  const url = API_TYPE_CONST.AUTION_REJECT.replace("{auctionId}", auctionId);
  return api.post(url, payload);
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
