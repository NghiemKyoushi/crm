"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateModel, FormData, ItemShippingList } from "@/types/fee-setting";
import {
  createNewInsurance,
  deleteInsurance,
  getFeeSettingDefault,
  getFeeShippingDefault,
  getListInsurance,
  updateFeeSettingDefault,
  updateFeeShippingDefault,
  updateInsurance,
} from "../apis/fee-setting";

// Query key
const INSURANCE_QUERY_KEY = ["insurance-packages"];

// Get list
export const useListInsurance = () => {
  return useQuery({
    queryKey: [...INSURANCE_QUERY_KEY],
    queryFn: () => getListInsurance(),
  });
};

// Create
export const useCreateInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateModel) => createNewInsurance(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSURANCE_QUERY_KEY });
    },
  });
};

// Update
export const useUpdateInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CreateModel }) =>
      updateInsurance(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSURANCE_QUERY_KEY });
    },
  });
};

// Delete
export const useDeleteInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteInsurance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSURANCE_QUERY_KEY });
    },
  });
};

export const useListFeeSettingDefault = () => {
  return useQuery({
    queryKey: ["fee-setting"],
    queryFn: () => getFeeSettingDefault(),
  });
};

export const useUpdateFeeSettingDefault = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ( body :FormData) =>
      updateFeeSettingDefault( body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-setting"] });
    },
  });
};

export const useListFeeShippingDefault = () => {
  return useQuery({
    queryKey: ["fee-shipping"],
    queryFn: () => getFeeShippingDefault(),
  });
};

export const useUpdateFeeShippingDefault = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ( body :ItemShippingList) =>
      updateFeeShippingDefault( body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-shipping"] });
    },
  });
};