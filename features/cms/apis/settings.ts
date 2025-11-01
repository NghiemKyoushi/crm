import api from "@/api/axiosClient";

export type CmsSetting = {
    id: number;
    key: string;
    value: string;
    description: string;
    is_enabled: boolean;
};

export const getCmsSettings = async (): Promise<CmsSetting[]> => {
    const res = await api.get(`/features/v1/admin/cms/settings`);
    // API wrapper returns { success, timestamp, code, message, message_key, data, errors }
    // data is directly an array of settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    console.log("📦 getCmsSettings full response:", res);
    console.log("📦 getCmsSettings payload:", payload);
    console.log("📦 getCmsSettings payload.data:", payload?.data);
    console.log("📦 getCmsSettings payload.data?.data:", payload?.data?.data);
    
    // Try multiple structures: data, data.data, or direct array
    let result: CmsSetting[] = [];
    if (Array.isArray(payload?.data)) {
        result = payload.data;
    } else if (Array.isArray(payload?.data?.data)) {
        result = payload.data.data;
    } else if (Array.isArray(payload)) {
        result = payload;
    }
    
    console.log("📦 getCmsSettings final result:", result);
    return result;
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


