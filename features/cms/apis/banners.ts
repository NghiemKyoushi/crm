import api from "@/api/axiosClient";

export type CmsBanner = {
    id: number;
    page_id: number;
    image_id: number;
    title: string;
    link: string;
    section: string;
    status: string;
    order_index: number;
};

export const getCmsBanners = async (pageId: number): Promise<CmsBanner[]> => {
    const res = await api.get(`/features/v1/admin/cms/banners`, { params: { pageId } });
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // data is directly an array of banners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    console.log("📦 getCmsBanners full response:", res);
    console.log("📦 getCmsBanners payload:", payload);
    console.log("📦 getCmsBanners payload.data:", payload?.data);
    
    // Response structure: { data: [...] } - data is directly an array
    let result: CmsBanner[] = [];
    if (Array.isArray(payload?.data)) {
        result = payload.data;
    } else if (Array.isArray(payload?.data?.data)) {
        result = payload.data.data;
    } else if (Array.isArray(payload)) {
        result = payload;
    }
    
    console.log("📦 getCmsBanners final result:", result);
    return result;
};

export type CreateCmsBannerBody = {
    page_id: number;
    image_id: number;
    title: string;
    link: string;
    section: string;
    order_index: number;
    status: string;
};

export type UpdateCmsBannerBody = CreateCmsBannerBody;

export const createCmsBanner = async (body: CreateCmsBannerBody): Promise<void> => {
    await api.post(`/features/v1/admin/cms/banners`, body);
};

export const updateCmsBanner = async (id: number, body: UpdateCmsBannerBody): Promise<void> => {
    await api.put(`/features/v1/admin/cms/banners/${id}`, body);
};

export const deleteCmsBanner = async (id: number): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/banners/${id}`);
};


