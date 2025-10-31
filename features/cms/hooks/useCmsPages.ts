"use client";

import { useQuery } from "@tanstack/react-query";
import { getCmsPages, CmsPage } from "../apis/pages";

export const CMS_QUERY_KEYS = {
    pages: ["cms", "pages"] as const,
};

export function useCmsPages() {
    return useQuery<CmsPage[]>({
        queryKey: CMS_QUERY_KEYS.pages,
        queryFn: getCmsPages,
    });
}


