import { useQuery } from "@tanstack/react-query";
import { getListOrder } from "../apis/orderhub";
import { InvoiceResponse } from "@/types/orderhub";

export const useListOrder = (params: {page: number, size: number}) => {
  return useQuery<InvoiceResponse>({
    queryKey: ["listwebsite", params],
    queryFn: () => getListOrder(params),
    // keepPreviousData: true,
  });
};