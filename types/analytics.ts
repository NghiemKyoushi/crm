/**
 * Analytics API Types
 * Based on Analytics API DTO Specification v1.0.0 (2025-11-26)
 */

// Common response structure
export interface ApiResponse<T> {
  code: number;
  message: string;
  message_key?: string;
  data: T;
}

// ================== Customer Analytics ==================

// 1. CustomerDebtDTO - Top Customers with Highest Debt
export interface CustomerDebtDTO {
  user_id: number;
  customer_name: string;
  email: string;
  phone_number: string | null;
  total_debt: number;
  total_paid: number;
  remaining_debt: number;
  pending_deposit_count: number;
  pending_payment_count: number;
}

// 2. TopCustomerDTO - Top Customers by Order Count / Spending
export interface TopCustomerDTO {
  user_id: number;
  customer_name: string;
  email: string;
  phone_number: string | null;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  created_at: string;
}

// 5. NewCustomerDTO - New Customers
export interface NewCustomerDTO {
  user_id: number;
  customer_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  sales_id: number | null;
  sales_name: string | null;
  has_placed_order: boolean;
  first_order_amount: number | null;
}

// 9. IncompleteOrderDTO - Customers with Incomplete Orders
export interface IncompleteOrderDTO {
  user_id: number;
  customer_name: string;
  email: string;
  phone_number: string | null;
  incomplete_order_count: number;
  oldest_incomplete_date: string;
  total_incomplete_value: number;
  last_status: string;
}

// ================== Product Analytics ==================

// 3. TopProductDTO - Most Ordered Products
export interface TopProductDTO {
  product_url: string;
  product_name: string;
  order_count: number;
  total_quantity: number;
  total_revenue: number;
  source_website: string;
}

// ================== Sales Analytics ==================

// 4. SalesPerformanceDTO - Sales Performance
export interface SalesPerformanceDTO {
  sales_id: number;
  sales_name: string;
  email: string;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
}

// ================== Order Analytics ==================

// 6. OrderTimelineDTO - Order Timeline
export interface OrderTimelineDTO {
  date: string;
  order_count: number;
  total_revenue: number;
  new_customers: number;
  average_order_value: number;
}

export type TimelineGroupBy = "hour" | "day" | "week" | "month";

// 8. PendingOrderDTO - Pending Orders
export interface PendingOrderDTO {
  order_id: number;
  invoice_no: string;
  user_id: number;
  customer_name: string;
  status: "PENDING" | "WAITING_CONFIRMATION" | "PROCESSING" | string;
  amount: number;
  created_at: string;
  days_pending: number;
  tracking_other: string | null;
}

// ================== Material/Inventory Analytics ==================

// 7. MaterialProfitLossDTO - Material Profit/Loss (FIFO)
export interface MaterialProfitLossDTO {
  partner_id: number;
  partner_name: string;
  currency_code: string;
  total_inflow: number;
  total_outflow: number;
  current_balance: number;
  realized_profit_loss: number;
  transaction_count: number;
}

// ================== Summary Analytics ==================

// 10. AnalyticsSummaryDTO
export interface DebtCustomerSummary {
  customer_name: string;
  remaining_debt: number;
}

export interface SpendingCustomerSummary {
  customer_name: string;
  total_spent: number;
}

export interface AnalyticsSummaryDTO {
  pending_order_count: number;
  incomplete_order_count: number;
  highest_debt_customer: DebtCustomerSummary | null;
  top_spending_customer: SpendingCustomerSummary | null;
}

// ================== Query Parameters ==================

export interface LimitParams {
  limit?: number;
}

export interface DateRangeParams {
  from_date?: string;
  to_date?: string;
}

export interface OrderTimelineParams extends DateRangeParams {
  group_by?: TimelineGroupBy;
}

export interface MaterialProfitLossParams extends DateRangeParams, LimitParams {}

// ================== Response Types ==================

export type CustomerDebtResponse = ApiResponse<CustomerDebtDTO[]>;
export type TopCustomerResponse = ApiResponse<TopCustomerDTO[]>;
export type NewCustomerResponse = ApiResponse<NewCustomerDTO[]>;
export type IncompleteOrderResponse = ApiResponse<IncompleteOrderDTO[]>;
export type TopProductResponse = ApiResponse<TopProductDTO[]>;
export type SalesPerformanceResponse = ApiResponse<SalesPerformanceDTO[]>;
export type OrderTimelineResponse = ApiResponse<OrderTimelineDTO[]>;
export type PendingOrderResponse = ApiResponse<PendingOrderDTO[]>;
export type MaterialProfitLossResponse = ApiResponse<MaterialProfitLossDTO[]>;
export type AnalyticsSummaryResponse = ApiResponse<AnalyticsSummaryDTO>;

// ================== Legacy Aliases (for backward compatibility) ==================
// These are kept for compatibility with existing code

export type TopDebtCustomer = CustomerDebtDTO;
export type TopCustomer = TopCustomerDTO;
export type NewCustomer = NewCustomerDTO;
export type IncompleteOrderCustomer = IncompleteOrderDTO;
export type TopProduct = TopProductDTO;
export type SalesPerformance = SalesPerformanceDTO;
export type OrderTimelineItem = OrderTimelineDTO;
export type PendingOrder = PendingOrderDTO;
export type MaterialProfitLoss = MaterialProfitLossDTO;
export type AnalyticsSummary = AnalyticsSummaryDTO;
export type HighestDebtCustomerSummary = DebtCustomerSummary;
export type TopSpendingCustomerSummary = SpendingCustomerSummary;

export type TopDebtCustomersResponse = CustomerDebtResponse;
export type TopOrderCustomersResponse = TopCustomerResponse;
export type TopSpendingCustomersResponse = TopCustomerResponse;
export type NewCustomersResponse = NewCustomerResponse;
export type IncompleteOrderCustomersResponse = IncompleteOrderResponse;
export type TopProductsResponse = TopProductResponse;
export type SalesPerformanceResponse_Legacy = SalesPerformanceResponse;
export type OrderTimelineResponse_Legacy = OrderTimelineResponse;
export type PendingOrdersResponse = PendingOrderResponse;
export type MaterialProfitLossResponse_Legacy = MaterialProfitLossResponse;
export type AnalyticsSummaryResponse_Legacy = AnalyticsSummaryResponse;
