import { useMutation, useQuery } from "@tanstack/react-query";
import {
  aproveOrder,
  cancelOrder,
  checkOrder,
  completeOrder,
  confirmPurchaeOrder,
  createOrder,
  getDetailOrder,
  getListOrder,
  getListService,
  trackingToJp,
  trackingToVn,
} from "../apis/orderhub";
import {
  ApproveOrderModel,
  FeeServiceCheck,
  InvoiceResponse,
  OrderFeeRequest,
  TrackingWeightInfo,
} from "@/types/orderhub";
import { OrderDetail } from "../components/modal/orderhub-detail-modal";

export const useListOrder = (params: { page: number; size: number , status?: string}) => {
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

export const useCancelOrder = () => {
  return useMutation({
    mutationFn: ({ reason, id }: { reason: string; id: string }) =>
      cancelOrder(id, reason),
  });
};

export const useTrackingOrder = () => {
  return useMutation({
    mutationFn: ({ tracking, id }: { tracking: string; id: string }) =>
      trackingToJp(id, tracking),
  });
};

export const useTrackingOrderVN = () => {
  return useMutation({
    mutationFn: ({ image_ids, id }: { image_ids: Array<number>; id: string }) =>
      trackingToVn(id, image_ids),
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
