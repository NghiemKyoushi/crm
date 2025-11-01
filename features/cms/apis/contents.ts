import api from "@/api/axiosClient";

export type CmsContent = {
    id: number;
    title: string;
    body: string;
    type: string;
    short_desc: string;
    status: string;
    image_id: number | null;
    order_index: number;
    position?: string;
};

export const getCmsContents = async (): Promise<CmsContent[]> => {
    const res = await api.get(`/features/v1/admin/cms/contents`);
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // Try multiple possible response structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    console.log("📦 getCmsContents full response:", res);
    console.log("📦 getCmsContents payload:", payload);
    console.log("📦 getCmsContents payload.data:", payload?.data);
    console.log("📦 getCmsContents payload.data?.data:", payload?.data?.data);
    
    // Try multiple structures: data, data.data, or direct array
    let result: CmsContent[] = [];
    if (Array.isArray(payload?.data)) {
        result = payload.data;
    } else if (Array.isArray(payload?.data?.data)) {
        result = payload.data.data;
    } else if (Array.isArray(payload)) {
        result = payload;
    }
    
    console.log("📦 getCmsContents final result:", result);
    return result;
};

export type CreateCmsContentBody = {
    title: string;
    short_desc: string;
    body: string;
    type: string; // e.g. html, markdown
    image_id: number | null;
    position: string; // e.g. main, sidebar
    order_index: number;
    status: string; // active/inactive
};

export type UpdateCmsContentBody = CreateCmsContentBody;

export const createCmsContent = async (body: CreateCmsContentBody): Promise<void> => {
    await api.post(`/features/v1/admin/cms/contents`, body);
};

export const updateCmsContent = async (id: number, body: UpdateCmsContentBody): Promise<void> => {
    await api.put(`/features/v1/admin/cms/contents/${id}`, body);
};

export const deleteCmsContent = async (id: number): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/contents/${id}`);
};


