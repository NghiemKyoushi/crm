import { useMutation, useQuery } from "@tanstack/react-query";
import {
  aproveOrder,
  cancelOrder,
  checkOrder,
  completeOrder,
  completeShippingOrder,
  confirmPurchaeOrder,
  createOrder,
  getDetailOrder,
  getListOrder,
  getListOrderTracking,
  getListService,
  trackingToJp,
  trackingToVn,
  updateOrder,
} from "../apis/orderhub";
import {
  ApproveOrderModel,
  FeeServiceCheck,
  InvoiceResponse,
  OrderFeeRequest,
  TrackingWeightInfo,
} from "@/types/orderhub";
import { OrderDetail } from "../components/modal/orderhub-detail-modal";

export const useListOrder = (params: { page: number; size: number , status?: string, search?: string, date?: string}) => {
  return useQuery<InvoiceResponse>({
    queryKey: ["listorder", params],
    queryFn: () => getListOrder(params),
    // keepPreviousData: true,
  });
};

export const useListOrderTracking = (params: { page: number; size: number , status?: Array<string>}) => {
  return useQuery({
    queryKey: ["listorderTracking", params],
    queryFn: () => getListOrderTracking(params),
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

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: ({ id, param }: { id: number; param: OrderFeeRequest }) =>
      updateOrder(id, param),
  });
};

export const useCancelOrder = () => {
  return useMutation({
    mutationFn: ({ reason, id }: { reason: string; id: string }) =>
      cancelOrder(id, reason),
  });
};

export const useTrackingOrder = () => {
  return useMutation({
    mutationFn: ({ tracking, id }: { tracking: Array<string>; id: string }) =>
      trackingToJp(id, tracking),
  });
};

export const useTrackingOrderVN = () => {
  return useMutation({
    mutationFn: ({ body, id }: { body: {image_ids?: Array<number>, is_repacked?: boolean, count_verify?: number}; id: string  }) =>
      trackingToVn(id, body),
  });
};

export const useApproveOrder = () => {
  return useMutation({
    mutationFn: ({ body, id }: { body: ApproveOrderModel; id: string }) =>
      aproveOrder(id, body),
  });
};

export const usePurchaseOrder = () => {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      confirmPurchaeOrder(id),
  });
};

export const useDetailOrder = (id: number) => {
  return useQuery<OrderDetail>({
    queryKey: ["detailorder", id],
    queryFn: () => getDetailOrder(id),
    // keepPreviousData: true,
  });
};

export const useCheckOrder = () => {
  return useMutation({
    mutationFn: ({ body, id }: { body: TrackingWeightInfo; id: string }) =>
      checkOrder(id, body),
  });
};

export const useCompleteOrder = () => {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      completeOrder(id),
  });
};

export const useCompleteShippingOrder = () => {
  return useMutation({
    mutationFn: ({ body }: {  body: { shipping_code: number,  cod_fee?: number, shipping_option?: string } }) =>
      completeShippingOrder(body),
  });
};
