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

export type CmsContentsResult = {
    items: CmsContent[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
};

export const getCmsContents = async (page: number = 1, size: number = 20): Promise<CmsContentsResult> => {
    const res = await api.get(`/features/v1/admin/cms/contents`, {
        params: { page, size }
    });
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // Try multiple possible response structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    console.log("📦 getCmsContents full response:", res);
    console.log("📦 getCmsContents payload:", payload);
    console.log("📦 getCmsContents payload.data:", payload?.data);
    console.log("📦 getCmsContents payload.data?.data:", payload?.data?.data);
    
    // Handle pagination response structure
    // Response: { data: { items: [...], currentPage: 0, pageSize: 20, ... } }
    let result: CmsContent[] = [];
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
    
    console.log("📦 getCmsContents final result:", { items: result, totalElements, totalPages, page: currentPage, size: pageSize });
    return { items: result, totalElements, totalPages, page: currentPage, size: pageSize };
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

export const getCmsContentDetail = async (id: number): Promise<CmsContent> => {
    const res = await api.get(`/features/v1/admin/cms/contents/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    
    // Try multiple structures
    if (payload?.data) {
        return payload.data;
    }
    return payload;
};


