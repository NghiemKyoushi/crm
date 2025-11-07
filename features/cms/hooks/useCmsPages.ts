"use client";

import { useQuery } from "@tanstack/react-query";
import { getCmsPages, CmsPage, CmsPagesResult } from "../apis/pages";

export const CMS_QUERY_KEYS = {
    pages: ["cms", "pages"] as const,
};

export function useCmsPages(page: number = 0, size: number = 20) {
    return useQuery<CmsPagesResult>({
        queryKey: [...CMS_QUERY_KEYS.pages, page, size],
        queryFn: () => getCmsPages(page, size),
    });
}


