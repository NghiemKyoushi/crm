export interface Category {
    id: number;
    group_name: string;
    description: string;
    customer_count: number;
    deposit_percentage: number;
    service_fee_percentage: number;
    cancellation_fee: number;
    is_delete: boolean;
    color: string;
  }
  
  export interface CategoryResponse {
    data: Category[];
    total_pages: number;
    total_items: number;
    current_page: number;
    page_size: number;
  }

  export type getListCateParams = {
    page: number;
    page_size: number;
    search?: string;
  };
  
  export interface CategoryRequest {
    group_name: string;
    description: string;
    deposit_percentage: number;
    service_fee_percentage?: number;
    cancellation_fee?: number;
    color?: string;

  }
  
  