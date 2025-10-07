export interface InvoiceResponse {
  data: Invoice[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export type OrderStatus =
  | "WAITING_APPROVAL"
  | "WAITING_DEPOSIT"
  | "PURCHASED"
  | "ARRIVED_JP"
  | "ARRIVED_VN"
  | "CHECKING"
  | "WAITING_PAYMENT"
  | "READY_TO_SHIP"
  | "ORDER_DELIVERED";

export enum OrderStatusType {
  PENDING_APPROVAL = "PENDING", // Đợi duyệt
  PENDING_DEPOSIT = "PENDING_DEPOSIT", // Đợi đặt cọc
  DEPOSIT_PAID = "DEPOSIT_PAID", // Đã đặt cọc (Client only)
  PURCHASED = "PURCHASED", // Đã mua hàng
  ARRIVED_JP_WAREHOUSE = "ARRIVED_JP_WAREHOUSE", // Về kho Nhật
  ARRIVED_VN_WAREHOUSE = "ARRIVED_VN_WAREHOUSE", // Hàng về kho Việt
  UNDER_INSPECTION = "UNDER_INSPECTION", // Đang kiểm hàng (Admin only)
  PENDING_PAYMENT = "PENDING_PAYMENT", // Đợi thanh toán
  READY_TO_SHIP = "READY_TO_SHIP", // Sẵn sàng chuyển
  SHIPPED = "SHIPPED", // Đã chuyển
  SHIPPING_REQUEST_CLIENT = "SHIPPING_REQUEST_CLIENT", // Tạo yêu cầu chuyển hàng
  CANCELED="CANCELED" // đã huỷ 
}

export interface Invoice {
  id: number;
  invoice_no: string;
  user_id: number;
  metadata: InvoiceMetadata;
  amount: number; // Tổng đơn hàng
  amount_vnd: number; // Tổng theo VND
  deposit_amount?: number; // Số tiền đặt cọc
  remain_amount?: number; // Số tiền còn lại
  description: string | null;
  status: string;
  created_by: number;
  created_at: string;
  customer_name: string;
  created_by_name: string;

  // Fake fields để map UI
  customer_code?: string; // SC244
  product_name?: string; // iPhone 15 Pro Max
  source?: string; // Amazon JP
  purchase_type?: string; // Mua thẳng / Đấu giá
  tracking_code?: string; // JP1234567890
  weight?: number; // Cân nặng (gram)
  is_user_created: boolean;
  tracking_other?: string;
  tracking_vn?: string;
  tracking_ship?: string;
  take_photo: boolean;
  is_repacked: boolean;
  is_verify_count: boolean;
  note?: string;
  shipping_fee?: number;
  weight_fee?: number;
  rate?: number;
  cod_shipping_price?: number;
  deposit_fee?: number;
  package_code: string;
  tracking_ship_list: TrackingRecord[],
  note_admin: string;
}

export interface InvoiceMetadata {
  items: InvoiceItem[];
  infos: any
}

export interface InvoiceItem {
  count: number;
  product: Product;
}

export interface Product {
  id: number;
  url: string;
  map_data: ProductMapData;
  created_at: string;
  updated_at: string;
  currency_code: string;
  items_per_unit?: number;
  route_id?: number;
}

export interface ProductMapData {
  price: string;
  images: string[];
  description: string;
  productName: string;
}
export interface DataFromLink {
  description: string;
  discount: null;
  id: number;
  images: string[];
  price: number;
  product_name: string;
  quantity: null;
  currency_code: string;
  route_id: number;
}

export interface InsuranceOptionModel {
  id: number;
  name: string;
  description: string;
  fee_percentage: number;
  max_value_vnd: number | null;
  status: "ACTIVE" | "INACTIVE" | string; // có thể refine thêm nếu biết rõ enum
  is_delete: boolean;
  created_at: string; // ISO datetime
  updated_at: string | null; // có thể null
}

export interface ServiceFee {
  id: number;
  code: string;
  name: string;
  description: string | null;
  amount: number;
  currency_code: string; // ví dụ: "VND", "USD", "JPY"
  method: number; // có thể define enum nếu có nhiều method
  optional: boolean;
}

export interface RateOrderRequest {
  category_fee_id: number;
  cod_in_japan: number;
  currency_code: string;
  fee_codes: string[];
  insurance_id: number;
  price: number;
  quantity: number;
  route_id: number;
  user_id: number;
}


export interface OrderFeeRequest {
  data: {
    product_id: number;
    count: number;
    price: number;
    description: string;
    name: string;
    items_per_unit?: number;
    item_quantity: number;
  };
  fee_codes: string[];
  insurance_id: number;
  description: string;
  user_id: number;
  // deposit_fee: number;
  product_category_id: number;
  cod_shipping_price: number;
  cod_type: number;
  // item_quantity: number;
}

export interface FeeServiceCheck {
  domestic_shipping_fee: number | null;
  service_fee: number;
  payment_fee: number;
  shipping_surcharge_fee: number | null;
  min_deposit_percent: number;
  insurance_fee: number;
}

export interface ApproveOrderModel {
  description: string;
  product_category_id: number;
  cod_shipping_price: number;
  cod_type: number;
}

export interface TrackingWeightInfo {
  weight: number;        
  weight_fee: number;    
  description: string; 
}

export interface TrackingWeightInfo {
  weight: number;        
  weight_fee: number;    
  description: string; 
}

export interface CreateTrackingModel {
  package_code: string;
  package_number: number;
  tracking_code: string;
  weight: number;
  id?:number 
}

export interface OrderFeeModel {
  domestic_shipping_fee: number | null;
  service_fee: number;
  payment_fee: number;
  shipping_surcharge_fee: number | null;
  min_deposit_percent: number;
  insurance_fee: number;
}

export interface TrackingRecord {
  id: number;
  order_id: number;
  tracking_code: string;
  created_at: string;   // ISO datetime string
  updated_at: string | null;
  package_code: string;
  package_number: number;
  weight: number;
}

export interface updateCodEachRowModel {
  cod_shipping_price: number;
  cod_type: number;
}