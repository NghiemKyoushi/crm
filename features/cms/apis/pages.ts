import api from "@/api/axiosClient";

export type CmsPage = {
    id: number;
    slug: string;
    title: string;
    description: string;
    short_desc: string;
    status: string;
    image_id: number;
};

export type CmsPagesResponse = {
    data: {
        data: CmsPage[];
    };
};

export const getCmsPages = async (): Promise<CmsPage[]> => {
    const res = await api.get<CmsPagesResponse>("/v1/admin/cms/pages");
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // We only need the nested data array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    return payload?.data?.data ?? [];
};

export type CreateCmsPageBody = {
    slug: string;
    title: string;
    description: string;
    short_desc: string;
    image_id: number;
    status: string;
};

export const createCmsPage = async (body: CreateCmsPageBody): Promise<void> => {
    await api.post("/v1/admin/cms/pages", body);
};

export type UpdateCmsPageBody = {
    title: string;
    description: string;
    short_desc: string;
    image_id: number;
    status: string;
};

export const updateCmsPage = async (
    id: number,
    body: UpdateCmsPageBody
): Promise<void> => {
    await api.put(`/v1/admin/cms/pages/${id}`, body);
};

export const deleteCmsPage = async (id: number): Promise<void> => {
    await api.delete(`/v1/admin/cms/pages/${id}`);
};


