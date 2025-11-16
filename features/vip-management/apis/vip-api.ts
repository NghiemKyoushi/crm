import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";

// Types based on actual API response
export interface VipPackage {
    id: number;
    name: string;
    price: number;
    max_auction_items: number;
    cancel_fee: number;
    duration_days: number;
    description: string;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface VipPackageParams {
    page?: number;
    page_size?: number;
    search?: string;
}

export interface VipPackageResponse {
    data: VipPackage[];
}

export interface CreateVipPackageRequest {
    name: string;
    price: number;
    max_auction_items: number;
    cancel_fee: number;
    duration_days: number;
    description: string;
}

export interface UpdateVipPackageRequest {
    name: string;
    price: number;
    max_auction_items: number;
    cancel_fee: number;
    duration_days: number;
    description: string;
}

// API functions
export const getVipPackages = async (params?: VipPackageParams) => {
    const res = await api.get(API_TYPE_CONST.VIP_PACKAGES, { params });
    // Response structure: { code: 200, message: "...", data: VipPackage[] }
    return res.data.data || [];
};

export const createVipPackage = async (data: CreateVipPackageRequest) => {
    const res = await api.post(API_TYPE_CONST.VIP_PACKAGES, data);
    return res.data;
};

export const updateVipPackage = async (id: number, data: UpdateVipPackageRequest) => {
    const res = await api.put(`${API_TYPE_CONST.VIP_PACKAGES}/${id}`, data);
    return res.data;
};

export const deleteVipPackage = async (id: number) => {
    const res = await api.delete(`${API_TYPE_CONST.VIP_PACKAGES}/${id}`);
    return res.data;
};

export const enableVipPackage = async (id: number, enabled: boolean) => {
    const res = await api.put(`${API_TYPE_CONST.VIP_PACKAGES}/${id}/enable?enabled=${enabled}`, null);
    return res.data;
};

