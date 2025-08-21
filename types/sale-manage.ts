export interface UserSaleItem {
  user_id: number;
  total: number;
  full_name: string;
}

export interface UserSaleResponse{
  data: UserSaleItem[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

