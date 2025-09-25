import { BankAccountListResponse, BankDepositRequest, DepositParams, DepositResponse, PaginatedWithdraw, TopupResponse } from "@/types/deposit-type";
import { useQuery } from "@tanstack/react-query";
import { getListBankCreateAccount, getListTopup, getListWithdraw } from "../apis";
import { PaginatedResponse } from "@/components/TableComponent";

export const useListTopups = (params: DepositParams) => {
  return useQuery<DepositResponse>({
    queryKey: ["listTopup", params],
    queryFn: () => getListTopup(params),
  });
};

export const useListWithdraw = (params: DepositParams) => {
    return useQuery<PaginatedWithdraw>({
      queryKey: ["listwithdraw", params],
      queryFn: () => getListWithdraw(params),
    });
};

export function useBankAccounts(params: BankDepositRequest) {
  return useQuery<BankAccountListResponse>({
    queryKey: ["bankAccounts", params],
    queryFn: () => getListBankCreateAccount(params),
    // keepPreviousData: true, // giữ data cũ khi chuyển trang
  });
}

export function mapDepositResponseToPaginatedResponse<T>(
  res: DepositResponse
): PaginatedResponse<T> {
  return {
    data: res.content as unknown as T[],
    total_pages: res.total_pages,
    total_items: res.total_elements,
    current_page: res.number + 1,
    page_size: res.size,
  };
}

export function mapBankResponseToPaginatedResponse<T>(
  res: BankAccountListResponse
): PaginatedResponse<T> {
  return {
    data: res.content as unknown as T[],
    total_pages: res.total_pages,
    total_items: res.total_elements,
    current_page: res.number + 1,
    page_size: res.size,
  };
}
export function useBankAccountsPartner(params: BankDepositRequest) {
  return useQuery<BankAccountListResponse>({
    queryKey: ["bankAccountsPartner", params],
    queryFn: () => getListBankCreateAccount(params),
    // keepPreviousData: true, // giữ data cũ khi chuyển trang
  });
}



