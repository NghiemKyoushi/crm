import api from "@/api/axiosClient";

export type CmsCategory = {
    id: number;
    slug: string;
    title: string;
    short_desc: string;
    status: string;
    image_id: number;
    order_index: number;
};

export type CmsCategoryContent = {
    id: number;
    title: string;
    short_desc: string;
    body: string;
    type: string;
    media_id: number;
    status: string;
};

export type CmsCategoryChild = {
    id: number;
    title: string;
    slug: string;
    status: string;
};

export type CmsCategoryDetail = CmsCategory & {
    contents: CmsCategoryContent[];
    children: CmsCategoryChild[];
};

export const getCmsCategories = async (): Promise<CmsCategory[]> => {
    const res = await api.get("/v1/admin/cms/categories");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    return payload?.data?.data ?? [];
};

export const getCmsCategoryDetail = async (id: number): Promise<CmsCategoryDetail> => {
    const res = await api.get(`/v1/admin/cms/categories/${id}`);
    // API shows data.data as array with one item; support both array/object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = res.data?.data?.data;
    return Array.isArray(d) ? (d[0] as CmsCategoryDetail) : (d as CmsCategoryDetail);
};

export type CreateCmsCategoryBody = {
    title: string;
    slug: string;
    short_desc: string;
    image_id: number;
    order_index: number;
    status: string; // active/inactive
};

export const createCmsCategory = async (body: CreateCmsCategoryBody): Promise<void> => {
    await api.post(`/v1/admin/cms/categories`, body);
};

export type UpdateCmsCategoryBody = CreateCmsCategoryBody;

export const updateCmsCategory = async (
    id: number,
    body: UpdateCmsCategoryBody
): Promise<void> => {
    await api.put(`/v1/admin/cms/categories/${id}`, body);
};

export const deleteCmsCategory = async (id: number): Promise<void> => {
    await api.delete(`/v1/admin/cms/categories/${id}`);
};


