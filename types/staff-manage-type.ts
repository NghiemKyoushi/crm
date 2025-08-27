export type getListStaffParams = {
  page: number;
  page_size: number;
  active?: boolean;
  search?: string;
};

export type getListStaffResponse = {
  data: UserData[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
};

export interface UserData {
  full_name: string;
  active?: boolean;
  user_id: number;
  email: string;
  phone_number: string;
  role_name: string;
}

export interface NewUserType {
  full_name: string;
  active?: string | boolean;
  email: string;
  phone_number: string;
  role_id: string;
  password?: string;
}