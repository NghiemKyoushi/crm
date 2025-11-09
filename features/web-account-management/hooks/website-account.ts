import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWebsiteAccount,
  deleteWebsiteAccount,
  getWebsiteAccounts,
  updateWebsiteAccount,
  WebsiteAccountPayload,
  WebsiteAccountResponse,
} from "../apis/website-account";

export const useGetWebsiteAccounts = (websiteId?: number) => {
  return useQuery<WebsiteAccountResponse[]>({
    queryKey: ["websiteAccounts", websiteId],
    queryFn: () => getWebsiteAccounts(websiteId as number),
    enabled: typeof websiteId === "number" && !Number.isNaN(websiteId),
  });
};

export const useCreateWebsiteAccount = (websiteId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WebsiteAccountPayload) =>
      createWebsiteAccount(payload),
    onSuccess: () => {
      if (websiteId) {
        queryClient.invalidateQueries({
          queryKey: ["websiteAccounts", websiteId],
        });
      }
    },
  });
};

export const useUpdateWebsiteAccount = (websiteId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WebsiteAccountPayload }) =>
      updateWebsiteAccount(id, payload),
    onSuccess: () => {
      if (websiteId) {
        queryClient.invalidateQueries({
          queryKey: ["websiteAccounts", websiteId],
        });
      }
    },
  });
};

export const useDeleteWebsiteAccount = (websiteId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWebsiteAccount(id),
    onSuccess: () => {
      if (websiteId) {
        queryClient.invalidateQueries({
          queryKey: ["websiteAccounts", websiteId],
        });
      }
    },
  });
};


