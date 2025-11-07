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

export type CmsPagesResult = {
    items: CmsPage[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
};

export const getCmsPages = async (page: number = 0, size: number = 20): Promise<CmsPagesResult> => {
    const res = await api.get<CmsPagesResponse>("/features/v1/admin/cms/pages", {
        params: { page, size }
    });
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // With pagination, data might be { content: [...], total: 100 } or directly array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    console.log("📦 getCmsPages full response:", res);
    console.log("📦 getCmsPages payload:", payload);
    console.log("📦 getCmsPages payload.data:", payload?.data);
    
    // Handle pagination response structure
    // Response: { data: { items: [...], currentPage: 0, pageSize: 20, totalElements: 6, totalPages: 1 } }
    let result: CmsPage[] = [];
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
    
    console.log("📦 getCmsPages final result:", { items: result, totalElements, totalPages, page: currentPage, size: pageSize });
    return { items: result, totalElements, totalPages, page: currentPage, size: pageSize };
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


