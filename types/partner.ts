export interface PartnerTransaction {
  description: string;
  amount: number;
  exchange_rate: number;
  amount_type: "IN" | "OUT"; // giả sử chỉ có 2 loại
  bank_name: string;
  partner_name: string;
  created_at: string;
}
export type PartnerTransactionList = PartnerTransaction[];

export type CurrencyCode = "VN" | "USD" | "JPY" | string;

export interface FinanceSummary {
  total_in: number;
  total_out: number;
  currency_code: CurrencyCode;
  partner_count: number;
}

export type getListMasterialParams = {
  page: number;
  page_size: number;
  search?: string;
  currencyCode: string;
};

export interface MasterialResponse {
  data: PartnerTransaction[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface MaterialTransactionRequest {
  partner_id: number;
  amount: number;
  currency_code: string;
  exchange_rate: number;
  note?: string;
  amount_type: "IN" | "OUT";
}
