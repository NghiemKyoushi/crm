import api from "@/api/axiosClient";

export type CmsSetting = {
    id: number;
    key: string;
    value: string;
    description: string;
    is_enabled: boolean;
};

export const getCmsSettings = async (): Promise<CmsSetting[]> => {
    const res = await api.get(`/v1/admin/cms/settings`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res.data;
    return payload?.data?.data ?? [];
};

export type CreateCmsSettingBody = {
    key: string;
    value: string;
    description: string;
    is_enabled: boolean;
};

export type UpdateCmsSettingBody = CreateCmsSettingBody;

export const createCmsSetting = async (body: CreateCmsSettingBody): Promise<void> => {
    await api.post(`/v1/admin/cms/settings`, body);
};

export const updateCmsSetting = async (id: number, body: UpdateCmsSettingBody): Promise<void> => {
    await api.put(`/v1/admin/cms/settings/${id}`, body);
};

export const deleteCmsSetting = async (id: number): Promise<void> => {
    await api.delete(`/v1/admin/cms/settings/${id}`);
};


