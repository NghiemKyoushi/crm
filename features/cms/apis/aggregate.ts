import api from "@/api/axiosClient";

export type AggregateItem = {
    id: number;
    title: string;
};

export type AggregateResponse = {
    success: boolean;
    timestamp: string;
    code: number;
    message: string;
    message_key: string;
    data: AggregateItem[];
    errors: null;
};

// GET functions for aggregate data
export const getPageCategories = async (pageId: number): Promise<AggregateItem[]> => {
    const res = await api.get<AggregateResponse>(`/features/v1/admin/cms/aggregate/page-category`, {
        params: { pageId }
    });
    return res.data.data || [];
};

export const getPageContents = async (pageId: number): Promise<AggregateItem[]> => {
    const res = await api.get<AggregateResponse>(`/features/v1/admin/cms/aggregate/page-content`, {
        params: { pageId }
    });
    return res.data.data || [];
};

export const getCategoryContents = async (categoryId: number): Promise<AggregateItem[]> => {
    const res = await api.get<AggregateResponse>(`/features/v1/admin/cms/aggregate/category-content`, {
        params: { categoryId }
    });
    return res.data.data || [];
};

export const getCategoryRelations = async (parentId: number): Promise<AggregateItem[]> => {
    const res = await api.get<AggregateResponse>(`/features/v1/admin/cms/aggregate/category-relation`, {
        params: { parentId }
    });
    return res.data.data || [];
};

// page-category
export const linkPageCategory = async (body: { page_id: number; category_id: number }): Promise<void> => {
    await api.post(`/features/v1/admin/cms/aggregate/page-category`, body);
};

export const unlinkPageCategory = async (body: { page_id: number; category_id: number }): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/aggregate/page-category`, { data: body });
};

// category-content
export const linkCategoryContent = async (body: { category_id: number; content_id: number }): Promise<void> => {
    await api.post(`/features/v1/admin/cms/aggregate/category-content`, body);
};

export const unlinkCategoryContent = async (body: { category_id: number; content_id: number }): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/aggregate/category-content`, { data: body });
};

// page-content
export const linkPageContent = async (body: { page_id: number; content_id: number }): Promise<void> => {
    await api.post(`/features/v1/admin/cms/aggregate/page-content`, body);
};

export const unlinkPageContent = async (body: { page_id: number; content_id: number }): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/aggregate/page-content`, { data: body });
};

// category-relation (parent-child)
export const linkCategoryRelation = async (body: { parent_id: number; child_id: number }): Promise<void> => {
    await api.post(`/features/v1/admin/cms/aggregate/category-relation`, body);
};

export const unlinkCategoryRelation = async (body: { parent_id: number; child_id: number }): Promise<void> => {
    await api.delete(`/features/v1/admin/cms/aggregate/category-relation`, { data: body });
};


