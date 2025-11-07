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
  user_name: string;
  transaction_id: string;
  handler:string;
  handler_time: string;
  customer_code: string;
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
  deposit_code?: string;
  from_date?: string;
  page?: number;
  size?: number;
  status?: string;
  to_date?: string;
  userConfirmed?: string;
  handler?:string;
}

export interface DepositRequest {
  user_id: number;
  amount_vnd: number;
  company_bank_account_id?: number;
  bank_transaction_id: number;
  reason: string;
  note: string;
}

export interface BankDepositRequest {
  page?: number;
  size?: number;
  type?:number;
  partner_id?:number;
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
  status: string;
  telegram_channel_id?: string;
  partner_name?: string;
  per_transaction_limit_vnd?:number;
  partner_id_name?: string;
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

export interface BankSettingAccountModel {
  account_holder: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  daily_limit_vnd: number;
  status: boolean;
  id?:number;
  partner_name?: string;
  description?:string;
  telegram_channel_id?: string;
  per_transaction_limit_vnd?: number;
  partner_id?: number;
}
// Một bản ghi topup
export interface withdrawItem {
  id: number;
  user_id: number;
  amount: number;
  user_bank_account_id: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED"; // có thể mở rộng thêm nếu có status khác
  note: string;
  processed_by: number | null;
  processed_at: string | null;
  transaction_id: string | null;
  rejection_reason: string | null;
  admin_note: string | null;
  fee_amount: number;
  net_amount: number | null;
  created_at: string;
  deposit_code: string;
  username: string;
  customer_code: string;
}

export interface PaginatedWithdraw {
  data: withdrawItem[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface TopupResponse {
  data: PaginatedWithdraw;
}

export type TransactionType = "TOPUP" | "WITHDRAW";

export type TransactionStatus =
  | "WAITING_CONFIRMATION"
  | "CANCELED"
  | "COMPLETED"
  | "PENDING"
  | "FAILED";

export interface TransactionHistory {
  id: number;
  transaction_type: TransactionType;
  transaction_id: number;
  old_status: TransactionStatus;
  new_status: TransactionStatus;
  action_by: number;
  action_at: string;
  reason: string | null;
  note: string | null;
  ip_address: string | null;
  user_agent: string | null;
  additional_data: Record<string, any> | null;
  status_change: boolean;
  status_change_description: string;
  username: string;
}

export interface withdrawModel {
  accountHolderName: string;
  accountNumber: string;
  adminNote: null;
  amount: number;
  bankName: string;
  createdAt: string;
  feeAmount: number;
  id: number;
  netAmount: number;
  note: string;
  processedAt: string;
  processedBy: number;
  qrCode: string;
  rejectionReason: string;
  status: string;
  transactionId: null;
  userBankAccountId: number;
  userId: number;
  userName: string;
  depositCode: string;
}

//debt
export interface DebtItem {
  id: number;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
  daily_limit_vnd: number;
  per_transaction_limit_vnd: number;
  type: number;
  partner_name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  telegram_channel_id: string;
  full_name?: string;
  total_debts: number;
  total_adjustments: number;
  total_paid_debts: number;
  total_remaining_debts: number;
  user_id?: number;
  email?: string;
  transaction_date?:string;
}

export interface Pagination {
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface ContentsResponse {
  data: DebtItem[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface SummaryItem {
  total_amount: number;
  total_account: number;
}

export interface ItemsSummary {
  Debts: SummaryItem;
  DebtsPaid: SummaryItem;
}

export interface DebtApiResponse {
    contents: ContentsResponse;
    items: ItemsSummary;
}
