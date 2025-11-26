import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  TopDebtCustomersResponse,
  TopOrderCustomersResponse,
  TopSpendingCustomersResponse,
  NewCustomersResponse,
  IncompleteOrderCustomersResponse,
  TopProductsResponse,
  SalesPerformanceResponse,
  OrderTimelineResponse,
  PendingOrdersResponse,
  MaterialProfitLossResponse,
  AnalyticsSummaryResponse,
  LimitParams,
  DateRangeParams,
  OrderTimelineParams,
  MaterialProfitLossParams,
} from "@/types/analytics";

// Customer Analytics
export const getTopDebtCustomers = async (
  params?: LimitParams
): Promise<TopDebtCustomersResponse> => {
  const response = await api.get(API_TYPE_CONST.ANALYTICS_CUSTOMERS_TOP_DEBT, {
    params,
  });
  return response.data;
};

export const getTopOrderCustomers = async (
  params?: LimitParams
): Promise<TopOrderCustomersResponse> => {
  const response = await api.get(API_TYPE_CONST.ANALYTICS_CUSTOMERS_TOP_ORDERS, {
    params,
  });
  return response.data;
};

export const getTopSpendingCustomers = async (
  params?: LimitParams
): Promise<TopSpendingCustomersResponse> => {
  const response = await api.get(
    API_TYPE_CONST.ANALYTICS_CUSTOMERS_TOP_SPENDING,
    { params }
  );
  return response.data;
};

export const getNewCustomers = async (
  params?: DateRangeParams
): Promise<NewCustomersResponse> => {
  const response = await api.get(API_TYPE_CONST.ANALYTICS_CUSTOMERS_NEW, {
    params,
  });
  return response.data;
};

export const getCustomersWithIncompleteOrders =
  async (): Promise<IncompleteOrderCustomersResponse> => {
    const response = await api.get(
      API_TYPE_CONST.ANALYTICS_CUSTOMERS_INCOMPLETE_ORDERS
    );
    return response.data;
  };

// Product Analytics
export const getTopOrderedProducts = async (
  params?: LimitParams
): Promise<TopProductsResponse> => {
  const response = await api.get(API_TYPE_CONST.ANALYTICS_PRODUCTS_TOP_ORDERED, {
    params,
  });
  return response.data;
};

// Sales Analytics
export const getSalesPerformance = async (
  params?: LimitParams
): Promise<SalesPerformanceResponse> => {
  const response = await api.get(API_TYPE_CONST.ANALYTICS_SALES_PERFORMANCE, {
    params,
  });
  return response.data;
};

// Order Analytics
export const getOrderTimeline = async (
  params?: OrderTimelineParams
): Promise<OrderTimelineResponse> => {
  const response = await api.get(API_TYPE_CONST.ANALYTICS_ORDERS_TIMELINE, {
    params,
  });
  return response.data;
};

export const getPendingOrders = async (): Promise<PendingOrdersResponse> => {
  const response = await api.get(API_TYPE_CONST.ANALYTICS_ORDERS_PENDING);
  return response.data;
};

// Material/Inventory Analytics
export const getMaterialProfitLoss = async (
  params?: MaterialProfitLossParams
): Promise<MaterialProfitLossResponse> => {
  const response = await api.get(
    API_TYPE_CONST.ANALYTICS_MATERIALS_PROFIT_LOSS,
    { params }
  );
  return response.data;
};

// Summary Analytics
export const getAnalyticsSummary =
  async (): Promise<AnalyticsSummaryResponse> => {
    const response = await api.get(API_TYPE_CONST.ANALYTICS_SUMMARY);
    return response.data;
  };
