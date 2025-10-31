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

export const getCmsBanners = async (page_id: number): Promise<CmsBanner[]> => {
    const res = await api.get(`/v1/admin/cms/banners`, { params: { page_id } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    return payload?.data?.data ?? [];
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
    await api.post(`/v1/admin/cms/banners`, body);
};

export const updateCmsBanner = async (id: number, body: UpdateCmsBannerBody): Promise<void> => {
    await api.put(`/v1/admin/cms/banners/${id}`, body);
};

export const deleteCmsBanner = async (id: number): Promise<void> => {
    await api.delete(`/v1/admin/cms/banners/${id}`);
};


