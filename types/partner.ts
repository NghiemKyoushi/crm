// ============================================================================
// TRANSACTION TYPES (Updated for FIFO API)
// ============================================================================

export interface PartnerTransaction {
  id: number;
  partnerName: string;
  bankName?: string;
  description?: string;
  amount: number;
  exchangeRate: number;
  createdAt: string;
  note?: string;
  remainingAmount?: number;
}

export type PartnerTransactionList = PartnerTransaction[];

export type CurrencyCode = "VND" | "USD" | "JPY" | "CNY" | string;

// ============================================================================
// FIFO BALANCE TYPES
// ============================================================================

export interface CurrencyBalance {
  currencyCode: string;
  fifoBalance: number;
  totalIncoming: number;
  totalOutgoing: number;
  transactionCount: number;
}

export interface FifoBalanceResponse {
  code: number;
  message: string;
  data: CurrencyBalance[];
}

// ============================================================================
// PROFIT/LOSS TYPES
// ============================================================================

export interface ProfitLossSummary {
  currencyCode: string;
  totalConsumed: number;
  totalProfitLossVnd: number;
  avgSellRate: number;
  avgCostRate: number;
  consumptionCount: number;
}

export interface ProfitLossSummaryResponse {
  code: number;
  message: string;
  data: ProfitLossSummary[];
}

// Response format: [date, currencyCode, totalConsumed, profitLossVnd, orderCount]
export type ProfitLossByDateItem = [string, string, number, number, number];

export interface ProfitLossByDateResponse {
  code: number;
  message: string;
  data: ProfitLossByDateItem[];
}

// Response format: [orderId, invoiceNo, currencyCode, totalConsumed, profitLossVnd, sellRate, costRate]
export type OrderProfitLossItem = [number, string, string, number, number, number, number];

export interface OrderProfitLossResponse {
  code: number;
  message: string;
  data: {
    data: OrderProfitLossItem[];
    page: number;
    size: number;
    total: number;
  };
}

// ============================================================================
// LEGACY TYPES (kept for backward compatibility)
// ============================================================================

export interface FinanceSummary {
  total_in: number;
  total_out: number;
  currency_code: CurrencyCode;
  partner_count: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export type getListMasterialParams = {
  page: number;
  page_size: number;
  search?: string;
  currency_code: string;
};

export interface MasterialResponse {
  data: PartnerTransaction[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface MaterialTransactionRequest {
  partnerId: number;
  amount: number;
  currencyCode: string;
  exchangeRate: number;
  note?: string;
  date?: string;
}

export interface RecalculateFifoParams {
  currencyCode?: string;
}

export interface ProfitLossByDateParams {
  currency_code: string;
  start_date: string;
  end_date: string;
}

export interface OrderProfitLossParams {
  currency_code?: string;
  page?: number;
  size?: number;
}
