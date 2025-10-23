import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  CheckComingCreateRequest,
  CheckComingRecord,
  CheckComingListResponse,
  ScanTrackingResponse,
  OrderInfo,
} from "../types";

export const checkComingApi = {
  // Create new check coming record
  create: async (data: CheckComingCreateRequest) => {
    const response = await api.post<{ data: CheckComingRecord }>(
      API_TYPE_CONST.CHECK_COMING_CREATE,
      data
    );
    return response.data.data;
  },

  // Get paginated list
  getList: async (page: number = 0, size: number = 20) => {
    const response = await api.get<{ data: CheckComingListResponse }>(
      API_TYPE_CONST.CHECK_COMING_LIST,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  },

  // Get by ID
  getById: async (id: number) => {
    const response = await api.get<{ data: CheckComingRecord }>(
      `${API_TYPE_CONST.CHECK_COMING_GET}/${id}`
    );
    return response.data.data;
  },

  // Delete record (soft delete)
  delete: async (id: number) => {
    const response = await api.delete(`${API_TYPE_CONST.CHECK_COMING_DELETE}/${id}`);
    return response.data;
  },

  // Search records
  search: async (params: {
    package_code?: string;
    tracking_code?: string;
    sender_name?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<{ data: CheckComingListResponse }>(
      API_TYPE_CONST.CHECK_COMING_SEARCH,
      { params }
    );
    return response.data.data;
  },

  // Get deleted records
  getDeleted: async (page: number = 0, size: number = 20) => {
    const response = await api.get<{ data: CheckComingListResponse }>(
      API_TYPE_CONST.CHECK_COMING_DELETED,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  },

  // Scan tracking code and get order list
  scanTrackingCode: async (trackingCode: string) => {
    const response = await api.get<{ data: ScanTrackingResponse }>(
      API_TYPE_CONST.SCAN_TRACKING_CODE,
      {
        params: { tracking_code: trackingCode },
      }
    );
    return response.data.data;
  },

  // Update order arrived at VN warehouse
  updateOrderArrivedVN: async (
    orderId: number,
    data: {
      take_photo?: boolean;
      is_repacked?: boolean;
      is_verify_count?: boolean;
    }
  ) => {
    const response = await api.patch<{ data: OrderInfo }>(
      `${API_TYPE_CONST.ORDER_ARRIVED_VN_WAREHOUSE}/${orderId}`,
      data
    );
    return response.data.data;
  },
};
