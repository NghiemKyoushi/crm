import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  aproveOrder,
  cancelOrder,
  checkOrder,
  completeOrder,
  completeShippingOrder,
  confirmPurchaeOrder,
  createOrder,
  getDataGeneral,
  getDetailOrder,
  getListOrder,
  getListOrderTracking,
  getListService,
  getListServiceAdmin,
  trackingToJp,
  trackingToVn,
  updateCodForEarchOrder,
  updateListService,
  updateNoteOrder,
  updateNoteOrderClient,
  updateOrder,
  updateTrackingOrder,
} from "../apis/orderhub";
import {
  ApproveOrderModel,
  CreateTrackingModel,
  FeeServiceCheck,
  InvoiceResponse,
  OrderFeeRequest,
  TrackingWeightInfo,
  updateCodEachRowModel,
} from "@/types/orderhub";
import { OrderDetail } from "../components/modal/orderhub-detail-modal";
import { ServiceFee } from "@/types/fee-setting";
import { FeeData } from "@/features/fee-settting/components/shipping-service-form";
import { FilterType } from "../components/order-hub-filter";

export const useListOrder = (params: FilterType
//   {
//   page: number;
//   size: number;
//   status?: string;
//   search?: string;
//   date?: string;
//   type?: number;
// }
) => {
  return useQuery<InvoiceResponse>({
    queryKey: ["listorder", params],
    queryFn: () => getListOrder(params),
    // keepPreviousData: true,
  });
};

export const useListOrderTracking = (params: {
  page: number;
  size: number;
  status?: Array<string>;
}) => {
  return useQuery({
    queryKey: ["listorderTracking", params],
    queryFn: () => getListOrderTracking(params),
    // keepPreviousData: true,
  });
};

export const useListService = (
  params: { routeId: number },
  options?: UseQueryOptions<any, Error> // <-- thêm options ở đây
) => {
  return useQuery({
    queryKey: ["listService", params],
    queryFn: () => getListService(params),
    ...options,
  });
};

export const useListServiceAdmin = (
  params: {userId?: number, routeId?: number },
  options?: UseQueryOptions<any, Error> // <-- thêm options ở đây
) => {
  return useQuery({
    queryKey: ["listServiceAdmin", params],
    queryFn: () => getListServiceAdmin(params),
    ...options,
  });
};

export const useUpdateListService = () => {
  return useMutation({
    mutationFn: ({ param }: { param: FeeData }) =>
      updateListService(param),
  });
};
export const useUpdateCodForEarchOrder = () => {
  return useMutation({
    mutationFn: ({ param, id }: { param: updateCodEachRowModel; id: number }) =>
      updateCodForEarchOrder(id, param),
  });
};

export const useUpdateNoteOrder = () => {
  return useMutation({
    mutationFn: ({ order_id, param }: {order_id: number,  param: { note: string } }) =>
      updateNoteOrder(order_id, param),
  });
};

export const useUpdateNoteOrderClient = () => {
  return useMutation({
    mutationFn: ({ id, param }: { id: number; param: { note: string } }) =>
      updateNoteOrderClient(id, param),
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
    mutationFn: ({  id }: { id: string }) =>
      trackingToJp(id),
  });
};

export const useTrackingOrderVN = () => {
  return useMutation({
    mutationFn: ({
      body,
      id,
    }: {
      body: {
        image_ids?: Array<number>;
        is_repacked?: boolean;
        count_verify?: number;
      };
      id: string;
    }) => trackingToVn(id, body),
  });
};

export const useUpdateTrackingOrder = () => {
  return useMutation({
    mutationFn: ({ body, id }: { body: CreateTrackingModel[]; id: number }) =>
      updateTrackingOrder(id, body),
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
    mutationFn: ({ id }: { id: string }) => confirmPurchaeOrder(id),
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
    mutationFn: ({ id }: { id: string }) => completeOrder(id),
  });
};

export const useCompleteShippingOrder = () => {
  return useMutation({
    mutationFn: ({
      body,
    }: {
      body: {
        shipping_code: string;
        shipping_type?: number;
        shipping_fee?: number;
        shipping_tracking?: string;
      };
    }) => completeShippingOrder(body),
  });
};

export function extractPathId(url?: string): string | null {
  if (!url) return null;
  try {
    const path = new URL(url).pathname; // /item/z495005608
    const segments = path.split("/").filter(Boolean);
    return segments[segments.length - 1] || null;
  } catch (e) {
    return null;
  }
}

export const useListDataGeneral = (params?: { customerGroupId?: number }) => {
  return useQuery({
    queryKey: ["listDataGeneral", params], // thêm params vào key để cache riêng
    queryFn: () => getDataGeneral(params),
    // enabled: !!params?.customerGroupId || params === undefined, 
  });
};
