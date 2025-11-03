import api from "@/api/axiosClient";

export type CmsSetting = {
    id: number;
    key: string;
    value: string;
    description: string;
    is_enabled: boolean;
};

export type CmsSettingsResult = {
    items: CmsSetting[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
};

export const getCmsSettings = async (page: number = 0, size: number = 20): Promise<CmsSettingsResult> => {
    const res = await api.get(`/features/v1/admin/cms/settings`, {
        params: { page, size }
    });
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // data is directly an array of settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    console.log("📦 getCmsSettings full response:", res);
    console.log("📦 getCmsSettings payload:", payload);
    console.log("📦 getCmsSettings payload.data:", payload?.data);
    console.log("📦 getCmsSettings payload.data?.data:", payload?.data?.data);
    
    // Handle pagination response structure
    // Response: { data: { items: [...], currentPage: 0, pageSize: 20, ... } }
    let result: CmsSetting[] = [];
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
    
    console.log("📦 getCmsSettings final result:", { items: result, totalElements, totalPages, page: currentPage, size: pageSize });
    return { items: result, totalElements, totalPages, page: currentPage, size: pageSize };
};

export type CreateCmsSettingBody = {
    key: string;
    value: string;
    description: string;
    is_enabled: boolean;
};

export type UpdateCmsSettingBody = CreateCmsSettingBody;

export const createCmsSetting = async (body: CreateCmsSettingBody): Promise<void> => {
    await api.post(`/features/v1/admin/cms/settings`, body);
};

export const updateCmsSetting = async (id: number, body: UpdateCmsSettingBody): Promise<void> => {
    await api.put(`/features/v1/admin/cms/settings/${id}`, body);
};

export const deleteCmsSetting = async (id: number): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/settings/${id}`);
};


