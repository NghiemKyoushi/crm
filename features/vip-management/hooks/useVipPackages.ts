import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getVipPackages,
    createVipPackage,
    updateVipPackage,
    deleteVipPackage,
    enableVipPackage,
    VipPackage,
    VipPackageParams,
    CreateVipPackageRequest,
    UpdateVipPackageRequest,
} from "../apis/vip-api";

export const useVipPackages = (params?: VipPackageParams) => {
    return useQuery<VipPackage[]>({
        queryKey: ["vipPackages", params],
        queryFn: () => getVipPackages(params),
    });
};

export const useCreateVipPackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateVipPackageRequest) => createVipPackage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vipPackages"] });
        },
    });
};

export const useUpdateVipPackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateVipPackageRequest }) =>
            updateVipPackage(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vipPackages"] });
        },
    });
};

export const useDeleteVipPackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteVipPackage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vipPackages"] });
        },
    });
};

export const useEnableVipPackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
            enableVipPackage(id, enabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vipPackages"] });
        },
    });
};

export const useInvalidateVipPackages = () => {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["vipPackages"] });
    };
};

