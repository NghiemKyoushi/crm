export interface Order {
  tracking_ship: string;
  customer_name: string;
  customer_code?: string;
  user_name: string;
  status: string;
  order_list: OrderItem[] | null; // nếu có danh sách đơn hàng chi tiết
  amount: number;
  amountvnd: number;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  invoice_no?: string;
  created_at?: string;
  tracking_vn?: string;
  tracking_other?: string;
  weight?: number;
  metadata?: any;
  description?: string;
  note?: string;
  shipping_fee?: number;
  weight_fee?: number;
  rate?: number;
  cod_shipping_price?: number;
  deposit_fee?: number;
  amount_vnd?: number;
  address?: string;
  created_by_name?: string;
  approved_by_name?: string;
  product_name?: string;
  quantity?: number;
  price?: number;
}