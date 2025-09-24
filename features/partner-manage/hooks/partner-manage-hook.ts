import { getListBankCreateAccount } from "@/features/finance-manage/apis";
import {
  BankAccountListResponse,
  BankDepositRequest,
} from "@/types/deposit-type";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { createNewMaterial, deleteMaterial, getListMaterial, getMaterialSumary } from "../apis/partner-manage";
import { getListStaffParams } from "@/types/staff-manage-type";
import { getListMasterialParams, MasterialResponse, MaterialTransactionRequest } from "@/types/partner";

export function useBankAccountsPartnerScreen(params: BankDepositRequest) {
  return useQuery<BankAccountListResponse>({
    queryKey: ["bankAccountsPartner", params],
    queryFn: () => getListBankCreateAccount(params),
    placeholderData: keepPreviousData,
  });
}

export const useListMaterial = (params: getListMasterialParams) => {
  return useQuery<MasterialResponse>({
    queryKey: ["listMaterial", params],
    queryFn: ()=>  getListMaterial(params),
    // staleTime: 1000 * 60, // cache 1 phút
    // refetchOnWindowFocus: false, // tránh gọi lại khi focus tab
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
