export interface DepositItem {
  id: number;
  user_id: number;
  amount_vnd: number;
  deposit_code: string;
  bank_account_id: number;
  status: string;
  created_at: string;
  confirmed_by: number;
  confirmed_at: string;
  canceled_by: number;
  canceled_at: string;
  note: string;
  updated_at: string;
  user_confirmed_transfer: boolean;
  amount: number;
  user_confirmed: boolean;
  processed: boolean;
}

export interface Pageable {
  page_number: number;
  page_size: number;
  sort: string[];
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface DepositResponse {
  content: DepositItem[];
  pageable: Pageable;
  last: boolean;
  total_pages: number;
  total_elements: number;
  size: number;
  number: number;
  sort: string[];
  first: boolean;
  number_of_elements: number;
  empty: boolean;
}

export interface DepositParams {
  bankAccountId?: string;
  depositCode?: string;
  fromDate?: string;
  page?: number;
  size?: number;
  status?: string;
  toDate?: string;
  userConfirmed?: string;
}

export interface DepositRequest {
  user_id: number;
  amoun_vnd: number;
  company_bank_account_id: number;
  bank_transaction_id: number;
  reason: string;
  note: string;
}

export interface BankDepositRequest {
    page?: number;
    size?: number;
}

export interface BankAccount {
    id: number;
    bank_name: string;
    bank_code: string;
    account_number: string;
    account_holder: string;
    daily_limit_vnd: number;
    is_active: boolean;
    created_at: string;   
    updated_at: string;   
    is_deleted: boolean | null;
  }
  
  export interface Pageable {
    page_number: number;
    page_size: number;
    sort: string[]; 
    offset: number;
    paged: boolean;
    unpaged: boolean;
  }
  
  export interface BankAccountListResponse {
    content: BankAccount[];
    pageable: Pageable;
    total_pages: number;
    total_elements: number;
    last: boolean;
    size: number;
    number: number;
    sort: any[]; // tương tự trên
    number_of_elements: number;
    first: boolean;
    empty: boolean;
  }
  

