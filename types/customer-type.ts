export interface CustomerParam {
  category_id?: number;
  page: number;
  page_size: number;
  sale_id?: number;
  search?: string;
}

export interface CustomerModel {
  color?: string;
  full_name: string;
  group_name: string;
  user_id: number;
  debt_amount: number;
  sale_name: string;
  category_id: number;
  email: string;
  group_id:number;
}

export interface CustomerResponse {
  data: CustomerModel[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface Profile {
  id: number;
  profile_image_id: number | null;
  nickname: string | null;
  intro: string | null;
  marry: string | null;
  gender: string | null; // "FEMALE" | "MALE" | null (nếu muốn strict hơn thì có thể union type)
  date_of_birth: string | null;
  full_name: string;
  job_id: number | null;
  edu_id: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  completion_score: number;
  avatar: string | null;
  role: string | null;
  hobbies: string | null;
  job: string | null;
  education: string | null;
  email: string | null;
  phone: string | null;
  user_id: number;
  birthday: string | null;
}

export interface CustomerDetail {
  customer_id: number;
  total_orders: number;
  total_expenses: number;
  debt_amount: number;
  user_profile: Profile;
  sale_profile: Profile;
  shipping_addresses: addressModel[];
  bank_accounts: bankAccountModel[];
}

export type ShippingAddress = unknown;
export type BankAccount = unknown;

export interface addressModel {
  address: string;
  phone_number: string;
  receive_name: string;
  is_default?: boolean;
  id?:number;
}

export interface bankAccountModel {
  account_holder_name: string;
  account_number: string;
  active: boolean;
  id?: number;
  bank_name?: string;
  default?: boolean;
  bank_id?: number;
}

export interface CustomerNoteParams {
  page: number;
  page_size: number;
}

export interface CustomerNoteDetail {
  id: number;
  author_id: number;
  customer_id: number;
  content: string;
  created_at: string;
  author_name: string;
}
