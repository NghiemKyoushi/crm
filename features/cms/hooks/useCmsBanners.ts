"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CmsBanner, getCmsBanners } from "../apis/banners";

export const CMS_BANNER_KEYS = {
    list: (pageId: number) => ["cms", "banners", pageId] as const,
};

export function useCmsBanners(pageId: number | null) {
    return useQuery<CmsBanner[]>({
        queryKey: pageId ? CMS_BANNER_KEYS.list(pageId) : ["cms", "banners", "idle"],
        queryFn: () => getCmsBanners(pageId as number),
        enabled: !!pageId,
    });
}

export function useInvalidateBanners() {
    const qc = useQueryClient();
    return (pageId: number) => qc.invalidateQueries({ queryKey: CMS_BANNER_KEYS.list(pageId) });
}


