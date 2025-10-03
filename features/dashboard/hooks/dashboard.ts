import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../apis/dashboard";
import { DashboardResponse } from "../types/dashboard";

export const useDashboardStats = () => {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    refetchInterval: 60000, // Refetch mỗi 60 giây
  });
};
