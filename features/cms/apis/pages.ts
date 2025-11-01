import api from "@/api/axiosClient";

export type CmsPage = {
    id: number;
    slug: string;
    title: string;
    description: string;
    short_desc: string;
    status: string;
    image_id: number | null;
};

export type CmsPagesResponse = {
    success: boolean;
    timestamp: string;
    code: number;
    message: string;
    message_key: string;
    data: CmsPage[];
    errors: null;
};

export const getCmsPages = async (): Promise<CmsPage[]> => {
    const res = await api.get<CmsPagesResponse>("/features/v1/admin/cms/pages");
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // data is directly an array of pages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    return payload?.data ?? [];
};

export type CreateCmsPageBody = {
    slug: string;
    title: string;
    description: string;
    short_desc: string;
    image_id: number | null;
    status: string;
};

export const createCmsPage = async (body: CreateCmsPageBody): Promise<void> => {
    await api.post("/features/v1/admin/cms/pages", body);
};

export type UpdateCmsPageBody = {
    slug: string;
    title: string;
    description: string;
    short_desc: string;
    image_id: number | null;
    status: string;
};

export const updateCmsPage = async (
    id: number,
    body: UpdateCmsPageBody
): Promise<void> => {
    await api.put(`/features/v1/admin/cms/pages/${id}`, body);
};

export const deleteCmsPage = async (id: number): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/pages/${id}`);
};


