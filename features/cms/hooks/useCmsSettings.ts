"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CmsSetting, getCmsSettings } from "../apis/settings";

export const CMS_SETTING_KEYS = {
    list: ["cms", "settings"] as const,
};

export function useCmsSettings() {
    return useQuery<CmsSetting[]>({
        queryKey: CMS_SETTING_KEYS.list,
        queryFn: getCmsSettings,
        onError: (error) => {
            console.error("❌ useCmsSettings error:", error);
        },
        onSuccess: (data) => {
            console.log("✅ useCmsSettings success, data:", data);
        },
    });
}

export function useInvalidateSettings() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: CMS_SETTING_KEYS.list });
}


