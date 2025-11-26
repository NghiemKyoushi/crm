import { useQuery } from "@tanstack/react-query";
import {
  getTopDebtCustomers,
  getTopOrderCustomers,
  getTopSpendingCustomers,
  getNewCustomers,
  getCustomersWithIncompleteOrders,
  getTopOrderedProducts,
  getSalesPerformance,
  getOrderTimeline,
  getPendingOrders,
  getMaterialProfitLoss,
  getAnalyticsSummary,
} from "../apis/analytics";
import {
  LimitParams,
  DateRangeParams,
  OrderTimelineParams,
  MaterialProfitLossParams,
} from "@/types/analytics";

// Query keys for cache management
export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: () => [...analyticsKeys.all, "summary"] as const,
  customers: () => [...analyticsKeys.all, "customers"] as const,
  customersTopDebt: (params?: LimitParams) =>
    [...analyticsKeys.customers(), "top-debt", params] as const,
  customersTopOrders: (params?: LimitParams) =>
    [...analyticsKeys.customers(), "top-orders", params] as const,
  customersTopSpending: (params?: LimitParams) =>
    [...analyticsKeys.customers(), "top-spending", params] as const,
  customersNew: (params?: DateRangeParams) =>
    [...analyticsKeys.customers(), "new", params] as const,
  customersIncomplete: () =>
    [...analyticsKeys.customers(), "incomplete-orders"] as const,
  products: () => [...analyticsKeys.all, "products"] as const,
  productsTopOrdered: (params?: LimitParams) =>
    [...analyticsKeys.products(), "top-ordered", params] as const,
  sales: () => [...analyticsKeys.all, "sales"] as const,
  salesPerformance: (params?: LimitParams) =>
    [...analyticsKeys.sales(), "performance", params] as const,
  orders: () => [...analyticsKeys.all, "orders"] as const,
  ordersTimeline: (params?: OrderTimelineParams) =>
    [...analyticsKeys.orders(), "timeline", params] as const,
  ordersPending: () => [...analyticsKeys.orders(), "pending"] as const,
  materials: () => [...analyticsKeys.all, "materials"] as const,
  materialsProfitLoss: (params?: MaterialProfitLossParams) =>
    [...analyticsKeys.materials(), "profit-loss", params] as const,
};

// Customer Analytics Hooks
export const useTopDebtCustomers = (params?: LimitParams, enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.customersTopDebt(params),
    queryFn: () => getTopDebtCustomers(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTopOrderCustomers = (params?: LimitParams, enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.customersTopOrders(params),
    queryFn: () => getTopOrderCustomers(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopSpendingCustomers = (
  params?: LimitParams,
  enabled = true
) => {
  return useQuery({
    queryKey: analyticsKeys.customersTopSpending(params),
    queryFn: () => getTopSpendingCustomers(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useNewCustomers = (params?: DateRangeParams, enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.customersNew(params),
    queryFn: () => getNewCustomers(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomersWithIncompleteOrders = (enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.customersIncomplete(),
    queryFn: getCustomersWithIncompleteOrders,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Product Analytics Hooks
export const useTopOrderedProducts = (params?: LimitParams, enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.productsTopOrdered(params),
    queryFn: () => getTopOrderedProducts(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Sales Analytics Hooks
export const useSalesPerformance = (params?: LimitParams, enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.salesPerformance(params),
    queryFn: () => getSalesPerformance(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Order Analytics Hooks
export const useOrderTimeline = (
  params?: OrderTimelineParams,
  enabled = true
) => {
  return useQuery({
    queryKey: analyticsKeys.ordersTimeline(params),
    queryFn: () => getOrderTimeline(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePendingOrders = (enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.ordersPending(),
    queryFn: getPendingOrders,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for pending orders
  });
};

// Material Analytics Hooks
export const useMaterialProfitLoss = (
  params?: MaterialProfitLossParams,
  enabled = true
) => {
  return useQuery({
    queryKey: analyticsKeys.materialsProfitLoss(params),
    queryFn: () => getMaterialProfitLoss(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Summary Analytics Hook
export const useAnalyticsSummary = (enabled = true) => {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: getAnalyticsSummary,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
