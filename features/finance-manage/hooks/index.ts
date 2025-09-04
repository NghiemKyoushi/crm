import { DepositParams, DepositResponse, TopupResponse } from "@/types/deposit-type";
import { useQuery } from "@tanstack/react-query";
import { getListTopup, getListWithdraw } from "../apis";
import { PaginatedResponse } from "@/components/TableComponent";

export const useListTopups = (params: DepositParams) => {
  return useQuery<DepositResponse>({
    queryKey: ["listTopup", params],
    queryFn: () => getListTopup(params),
  });
};

export const useListWithdraw = (params: DepositParams) => {
    return useQuery<TopupResponse>({
      queryKey: ["listTopup", params],
      queryFn: () => getListWithdraw(params),
    });
};

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
