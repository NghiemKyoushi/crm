"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CmsSetting, getCmsSettings, CmsSettingsResult } from "../apis/settings";

export const CMS_SETTING_KEYS = {
    list: ["cms", "settings"] as const,
};

export function useCmsSettings(page: number = 0, size: number = 20) {
    const query = useQuery<CmsSettingsResult>({
        queryKey: [...CMS_SETTING_KEYS.list, page, size],
        queryFn: () => getCmsSettings(page, size),
    });

    useEffect(() => {
        if (query.isError && query.error) {
            console.error("❌ useCmsSettings error:", query.error);
        }
    }, [query.isError, query.error]);

    useEffect(() => {
        if (query.isSuccess && query.data) {
            console.log("✅ useCmsSettings success, data:", query.data);
        }
    }, [query.isSuccess, query.data]);

    return query;
}

export function useInvalidateSettings() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: CMS_SETTING_KEYS.list });
}


