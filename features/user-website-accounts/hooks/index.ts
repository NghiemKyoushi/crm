import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignUserWebsiteAccounts,
  getUserWebsiteAccountCount,
  getUserWebsiteAccounts,
  UserWebsiteAccountItem,
} from "../apis/index";

export const useUserWebsiteAccounts = (userId?: number) => {
  return useQuery<UserWebsiteAccountItem[]>({
    queryKey: ["userWebsiteAccounts", userId],
    queryFn: () => getUserWebsiteAccounts(userId as number),
    enabled: !!userId && !Number.isNaN(userId as number),
  });
};

export const useUserWebsiteAccountCount = (userId?: number) => {
  return useQuery<number>({
    queryKey: ["userWebsiteAccountCount", userId],
    queryFn: () => getUserWebsiteAccountCount(userId as number),
    enabled: !!userId && !Number.isNaN(userId as number),
  });
};

export const useAssignUserWebsiteAccounts = (userId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountIds: number[]) =>
      assignUserWebsiteAccounts(userId as number, accountIds),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["userWebsiteAccounts", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["userWebsiteAccountCount", userId],
        });
      }
    },
  });
};


