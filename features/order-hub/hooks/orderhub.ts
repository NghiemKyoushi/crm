import { useMutation, useQuery } from "@tanstack/react-query";
import { createOrder, getListOrder, getListService } from "../apis/orderhub";
import { InvoiceResponse, OrderFeeRequest } from "@/types/orderhub";

export const useListOrder = (params: {page: number, size: number}) => {
  return useQuery<InvoiceResponse>({
    queryKey: ["listorder", params],
    queryFn: () => getListOrder(params),
    // keepPreviousData: true,
  });
};


export const useListService = () => {
  return useQuery({
    queryKey: ["listService"],
    queryFn: () => getListService(),
    // keepPreviousData: true,
  });
};
export const useCreateNewOrder = () => {
  return useMutation({
    mutationFn: (param: OrderFeeRequest) => createOrder(param),
  });
};
