"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CmsContent, getCmsContents, CmsContentsResult } from "../apis/contents";

export const CMS_CONTENT_KEYS = {
    list: ["cms", "contents"] as const,
};

export function useCmsContents(page: number = 1, size: number = 20) {
    return useQuery<CmsContentsResult>({
        queryKey: [...CMS_CONTENT_KEYS.list, page, size],
        queryFn: () => getCmsContents(page, size),
    });
}

export function useInvalidateContents() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: CMS_CONTENT_KEYS.list });
}


