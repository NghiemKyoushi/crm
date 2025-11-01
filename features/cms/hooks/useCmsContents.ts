"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CmsContent, getCmsContents } from "../apis/contents";

export const CMS_CONTENT_KEYS = {
    list: ["cms", "contents"] as const,
};

export function useCmsContents() {
    return useQuery<CmsContent[]>({
        queryKey: CMS_CONTENT_KEYS.list,
        queryFn: getCmsContents,
        onError: (error) => {
            console.error("❌ useCmsContents error:", error);
        },
        onSuccess: (data) => {
            console.log("✅ useCmsContents success, data:", data);
        },
    });
}

export function useInvalidateContents() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: CMS_CONTENT_KEYS.list });
}


