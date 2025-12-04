import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
// import { AUTION_LINKS, AUTION_CUSTOMERS, AUTION_APPROVE, AUTION_REJECT, AUTION_FINAL, AUTION_CANCEL } from "";

// Các phương thức có thể cần (get/post/put/delete) tuỳ vào tác vụ từng endpoint
// Kiểu trả về và body có thể tuỳ theo thực tế hoặc khai báo bất kỳ (any)

// Lấy danh sách links đấu giá
export const fetchAuctionLinks = (params?: any) => {
  return api.get(API_TYPE_CONST.AUTION_LINKS, { params });
};

// Lấy danh sách khách hàng đấu giá
export const fetchAuctionCustomers = (params?: any) => {
  return api.get(API_TYPE_CONST.AUTION_CUSTOMERS, { params });
};

// Yêu cầu duyệt đơn đấu giá (approve)
export const approveAuction = (auctionId: string, payload?: any) => {
  const url = API_TYPE_CONST.AUTION_APPROVE.replace("{id}", auctionId);
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


