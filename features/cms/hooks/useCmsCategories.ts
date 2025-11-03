"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CmsCategory, CmsCategoryDetail, getCmsCategories, getCmsCategoryDetail, CmsCategoriesResult } from "../apis/categories";

export const CMS_CATEGORY_KEYS = {
    list: ["cms", "categories"] as const,
    detail: (id: number) => ["cms", "categories", id] as const,
};

export function useCmsCategories(page: number = 0, size: number = 20) {
    return useQuery<CmsCategoriesResult>({
        queryKey: [...CMS_CATEGORY_KEYS.list, page, size],
        queryFn: () => getCmsCategories(page, size),
    });
}

export function useCmsCategoryDetail(id: number | null) {
    return useQuery<CmsCategoryDetail>({
        queryKey: id ? CMS_CATEGORY_KEYS.detail(id) : ["cms", "categories", "detail", "idle"],
        queryFn: () => getCmsCategoryDetail(id as number),
        enabled: !!id,
    });
}

export function useInvalidateCategories() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: CMS_CATEGORY_KEYS.list });
}


