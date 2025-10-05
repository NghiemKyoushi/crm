export interface ShipmentPackage {
  tracking_ship: string;
  customer_name: string;
  customer_code?: string;
  user_name: string | null;
  status: string;
  order_list: OrderItem[];
  amount: number; // Tổng tiền JPY của tất cả orders trong vận đơn
  amountvnd: number; // Tổng tiền VND của tất cả orders trong vận đơn
  quantity: number; // Số lượng orders trong vận đơn
  created_at?: string;
}

export interface OrderItem {
  id: number;
  invoice_no?: string;
  created_at?: string;
  tracking_ship?: string;
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
  amount?: number; // JPY
  amount_vnd?: number; // VND
  address?: string;
  created_by_name?: string;
  approved_by_name?: string;
  approved_by?: number;
  created_by?: number;
  customer_name?: string;
  user_name?: string | null;
  user_id?: number;
  status?: string;
  is_user_created?: boolean;
  product_name?: string;
  quantity?: number;
  price?: number;
  take_photo?: boolean;
  is_repacked?: boolean;
  is_verify_count?: boolean;
}

// For backward compatibility
export interface Order extends ShipmentPackage {
  tracking_ship_list?: TrackingRecord[];
}

export interface TrackingRecord {
  id: number;
  order_id: number;
  tracking_code: string;
  created_at: string;
  updated_at: string | null;
  package_code: string;
  package_number: number;
  weight: number;
}