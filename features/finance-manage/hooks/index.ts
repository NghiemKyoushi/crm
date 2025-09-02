import { DepositParams, DepositResponse } from "@/types/deposit-type";
import { useQuery } from "@tanstack/react-query";
import { getListTopup } from "../apis";

export const useListTopups = (params: DepositParams) => {
  return useQuery<DepositResponse>({
    queryKey: ["listTopup", params],
    queryFn: () => getListTopup(params),
  });
};

export const useListWithdraw = (params: DepositParams) => {
    return useQuery<DepositResponse>({
      queryKey: ["listTopup", params],
      queryFn: () => getListTopup(params),
    });
};
