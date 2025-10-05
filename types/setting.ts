export interface CurrencyRate {
  id: number;
  currency_code: string;   
  rate_to_vnd: number;     
  created_at: string;      
  created_by: number;
  updated_at: string;      
  updated_by: number;
  full_name: string
}

export interface CurrencyRateResponse {
  data: CurrencyRate[];
}

export interface UpdateListRateParams{
  data: ListRateParams[];
}

export interface UpdateListRateParamsCheck{
  list: ListRateParams[];
  customer_group_id?: number;
}

export interface ListRateParams{
  id?: number;
  rate_to_vnd: number;
  currency_code: string;
}