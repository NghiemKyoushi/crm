import { getListBankCreateAccount } from "@/features/finance-manage/apis";
import {
  BankAccountListResponse,
  BankDepositRequest,
} from "@/types/deposit-type";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  createNewMaterial,
  deleteMaterial,
  getListMaterial,
  getMaterialSumary,
  getFifoBalance,
  recalculateFifo,
  getProfitLossSummary,
  getProfitLossByDate,
  getOrderProfitLoss
} from "../apis/partner-manage";
import {
  getListMasterialParams,
  MaterialTransactionRequest,
  RecalculateFifoParams,
  ProfitLossByDateParams,
  OrderProfitLossParams
} from "@/types/partner";

// ============================================================================
// BANK ACCOUNTS HOOKS
// ============================================================================

export function useBankAccountsPartnerScreen(params: BankDepositRequest) {
  return useQuery<BankAccountListResponse>({
    queryKey: ["bankAccountsPartner", params],
    queryFn: () => getListBankCreateAccount(params),
    placeholderData: keepPreviousData,
  });
}

// ============================================================================
// MATERIAL TRANSACTION HOOKS
// ============================================================================

export const useListMaterial = (params: getListMasterialParams) => {
  return useQuery({
    queryKey: ["listMaterial", params],
    queryFn: () => getListMaterial(params),
    staleTime: 1000 * 60, // cache 1 minute
    refetchOnWindowFocus: false,
  });
};

export const useListMaterialSumary = () => {
  return useQuery({
    queryKey: ["listMaterialSumary"],
    queryFn: getMaterialSumary,
    refetchOnWindowFocus: false,
  });
};

export const useCreateNewMaterial = () => {
  return useMutation({
    mutationFn: (param: MaterialTransactionRequest) => createNewMaterial(param),
  });
};

export const useDeleteMaterial = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteMaterial(id),
  });
};

// ============================================================================
// FIFO BALANCE HOOKS
// ============================================================================

export const useFifoBalance = () => {
  return useQuery({
    queryKey: ["fifoBalance"],
    queryFn: getFifoBalance,
    staleTime: 1000 * 30, // cache 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useRecalculateFifo = () => {
  return useMutation({
    mutationFn: (params?: RecalculateFifoParams) => recalculateFifo(params),
  });
};

// ============================================================================
// PROFIT/LOSS HOOKS
// ============================================================================

export const useProfitLossSummary = (currencyCode?: string) => {
  return useQuery({
    queryKey: ["profitLossSummary", currencyCode],
    queryFn: () => getProfitLossSummary(currencyCode),
    staleTime: 1000 * 60, // cache 1 minute
    refetchOnWindowFocus: false,
  });
};

export const useProfitLossByDate = (params: ProfitLossByDateParams) => {
  return useQuery({
    queryKey: ["profitLossByDate", params],
    queryFn: () => getProfitLossByDate(params),
    enabled: !!params.currency_code && !!params.start_date && !!params.end_date,
    staleTime: 1000 * 60 * 5, // cache 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useOrderProfitLoss = (params: OrderProfitLossParams) => {
  return useQuery({
    queryKey: ["orderProfitLoss", params],
    queryFn: () => getOrderProfitLoss(params),
    staleTime: 1000 * 60, // cache 1 minute
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
