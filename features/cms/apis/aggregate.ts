import api from "@/api/axiosClient";

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


