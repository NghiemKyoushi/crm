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
    const res = await api.get(`/v1/admin/cms/contents`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    return payload?.data?.data ?? [];
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
    await api.post(`/v1/admin/cms/contents`, body);
};

export const updateCmsContent = async (id: number, body: UpdateCmsContentBody): Promise<void> => {
    await api.put(`/v1/admin/cms/contents/${id}`, body);
};

export const deleteCmsContent = async (id: number): Promise<void> => {
    await api.delete(`/v1/admin/cms/contents/${id}`);
};


