import {
  AddWebsiteModel,
  CountryResponse,
  Region,
  WebsiteListResponse,
  WebsiteParams,
  UpdateSelectorConfigRequest,
  TestSelectorConfigRequest
} from "@/types/website-manage";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createNewWebsite,
  deleteWebsite,
  getListWebsite,
  listRegion,
  listRoute,
  updateWebsite,
  updateSelectorConfig,
  testSelectorConfig,
} from "../apis/web-manage";

export const useListWebsite = (params: WebsiteParams) => {
  return useQuery<WebsiteListResponse>({
    queryKey: ["listwebsite", params],
    queryFn: () => getListWebsite(params),
    // keepPreviousData: true,
  });
};

export const useCreateNewWebsite = () => {
  return useMutation({
    mutationFn: (param: AddWebsiteModel) => createNewWebsite(param),
  });
};

export const useUpdateWebsite = () => {
  return useMutation({
    mutationFn: ({ id, param }: { id: number; param: AddWebsiteModel }) =>
      updateWebsite(id, param),
  });
};

export const useDeleteWebsite = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteWebsite(id),
  });
};

export const useListRegion = () => {
  return useQuery<CountryResponse>({
    queryKey: ["listRegion"],
    queryFn: listRegion,
  });
};

export const useListRoutes = () => {
  return useQuery({
    queryKey: ["listRoute"],
    queryFn: () => listRoute(),
  });
};

export const useUpdateSelectorConfig = () => {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateSelectorConfigRequest;
    }) => updateSelectorConfig(id, body),
  });
};

export const useTestSelectorConfig = () => {
  return useMutation({
    mutationFn: (body: TestSelectorConfigRequest) => testSelectorConfig(body),
  });
};
