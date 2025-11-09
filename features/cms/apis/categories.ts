import api from "@/api/axiosClient";

export type CmsCategory = {
    id: number;
    slug: string;
    title: string;
    short_desc: string;
    status: string;
    image_id: number | null;
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

export type CmsCategoriesResult = {
    items: CmsCategory[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
};

export const getCmsCategories = async (page: number = 0, size: number = 20): Promise<CmsCategoriesResult> => {
    const res = await api.get("/features/v1/admin/cms/categories", {
        params: { page, size }
    });
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // With pagination, data might be { content: [...], total: 100 } or directly array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    console.log("📦 getCmsCategories full response:", res);
    console.log("📦 getCmsCategories payload:", payload);
    console.log("📦 getCmsCategories payload.data:", payload?.data);

    // Handle pagination response structure
    // Response: { data: { items: [...], currentPage: 0, pageSize: 20, ... } }
    let result: CmsCategory[] = [];
    let totalElements = payload?.data?.totalElements ?? payload?.data?.total ?? payload?.totalElements ?? 0;
    let totalPages = payload?.data?.totalPages ?? payload?.totalPages ?? 1;
    let currentPage = payload?.data?.currentPage ?? payload?.data?.page ?? page;
    let pageSize = payload?.data?.pageSize ?? payload?.data?.size ?? size;
    if (Array.isArray(payload?.data?.items)) {
        // Pagination structure: { data: { items: [...], currentPage, pageSize, ... } }
        result = payload.data.items;
    } else if (Array.isArray(payload?.data)) {
        result = payload.data;
    } else if (Array.isArray(payload?.data?.content)) {
        result = payload.data.content;
        totalElements = payload?.data?.totalElements ?? totalElements;
        totalPages = payload?.data?.totalPages ?? totalPages;
        currentPage = payload?.data?.number ?? currentPage;
        pageSize = payload?.data?.size ?? pageSize;
    } else if (Array.isArray(payload?.data?.data)) {
        result = payload.data.data;
    } else if (Array.isArray(payload)) {
        result = payload;
    }

    console.log("📦 getCmsCategories final result:", { items: result, totalElements, totalPages, page: currentPage, size: pageSize });
    return { items: result, totalElements, totalPages, page: currentPage, size: pageSize };
};

export const getCmsCategoryDetail = async (id: number): Promise<CmsCategoryDetail> => {
    const res = await api.get(`/features/v1/admin/cms/categories/${id}`);
    // API shows data.data as array with one item; support both array/object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = res.data?.data?.data;
    return Array.isArray(d) ? (d[0] as CmsCategoryDetail) : (d as CmsCategoryDetail);
};

export type CreateCmsCategoryBody = {
    title: string;
    slug: string;
    short_desc: string;
    image_id: number | null;
    order_index: number;
    status: string; // active/inactive
};

export const createCmsCategory = async (body: CreateCmsCategoryBody): Promise<void> => {
    await api.post(`/features/v1/admin/cms/categories`, body);
};

export type UpdateCmsCategoryBody = CreateCmsCategoryBody;

export const updateCmsCategory = async (
    id: number,
    body: UpdateCmsCategoryBody
): Promise<void> => {
    await api.put(`/features/v1/admin/cms/categories/${id}`, body);
};

export const deleteCmsCategory = async (id: number): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/categories/${id}`);
};


