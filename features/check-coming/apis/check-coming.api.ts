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
      verify_count_value?: number; // Số lượng kiểm đếm
      is_repacked_done?: boolean; // Đã đóng lại chưa
      document_image_ids?: number[]; // IDs ảnh chứng từ
      product_image_ids?: number[]; // IDs ảnh sản phẩm
    }
  ) => {
    const response = await api.patch<{ data: OrderInfo }>(
      `${API_TYPE_CONST.ORDER_ARRIVED_VN_WAREHOUSE}/${orderId}`,
      data
    );
    return response.data.data;
  },

  // Upload image
  uploadImage: async (file: File, type: number = 1) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type.toString());

    const response = await api.post<{ data: any }>(
      API_TYPE_CONST.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Complete order (mark as done)
  completeOrderArrivedVN: async (
    orderId: number,
    data: {
      count_verify?: number; // Số lượng kiểm đếm
      image_ids?: number[]; // IDs ảnh (document + product)
      is_repacked?: boolean; // Đã đóng lại
    }
  ) => {
    const response = await api.put<{ data: any }>(
      `${API_TYPE_CONST.COMPLETE_ORDER_ARRIVED_VN}/${orderId}`,
      data
    );
    return response.data.data;
  },
};
