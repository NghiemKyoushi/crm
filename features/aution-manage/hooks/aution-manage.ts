import { useQuery } from "@tanstack/react-query";
import {
  fetchAuctionLinks,
  fetchAuctionCustomers,
  approveAuction,
  rejectAuction,
  finalizeAuction,
  adminCancelAuction,
  fetchAuctionResultTab,
  fetchAuctionVipCustomers,
} from "../apis/aution-manage";
import { AutionParams } from "../types/aution-manage";
export const useAuctionLinks = (params?: AutionParams) => {
  return useQuery({
    queryKey: ["auction-links", params],
    queryFn: () => fetchAuctionLinks(params),
  });
};

export const useAuctionCustomers = (params?: any) => {
  return useQuery({
    queryKey: ["auction-customers", params],
    queryFn: () => fetchAuctionCustomers(params),
  });
};

export const useAuctionResultTab = (params?: any) => {
  return useQuery({
    queryKey: ["auction-result-tab", params],
    queryFn: () => fetchAuctionResultTab(params),
  });
};

export const useAuctionVipCustomers = (params?: any) => {
  return useQuery({
    queryKey: ["auction-vip-customers", params],
    queryFn: () => fetchAuctionVipCustomers(params),
  });
};

// // Duyệt đơn đấu giá (approve)
// export const useApproveAuction = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     ({ auctionId, payload }: { auctionId: string; payload?: any }) =>
//       approveAuction(auctionId, payload),
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries("auction-links");
//         queryClient.invalidateQueries("auction-customers");
//       },
//     }
//   );
// };

// // Từ chối đơn đấu giá (reject)
// export const useRejectAuction = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     ({ auctionId, payload }: { auctionId: string; payload?: any }) =>
//       rejectAuction(auctionId, payload),
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries("auction-links");
//         queryClient.invalidateQueries("auction-customers");
//       },
//     }
//   );
// };

// // Hoàn tất/Chốt phiên đấu giá (finalize)
// export const useFinalizeAuction = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     ({ auctionId, payload }: { auctionId: string; payload?: any }) =>
//       finalizeAuction(auctionId, payload),
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries("auction-links");
//         queryClient.invalidateQueries("auction-customers");
//       },
//     }
//   );
// };

// // Admin hủy phiên đấu giá (admin-cancel)
// export const useAdminCancelAuction = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     ({ auctionId, payload }: { auctionId: string; payload?: any }) =>
//       adminCancelAuction(auctionId, payload),
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries("auction-links");
//         queryClient.invalidateQueries("auction-customers");
//       },
//     }
//   );
// };
