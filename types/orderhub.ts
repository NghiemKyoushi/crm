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
  weight?: string; // 2.1kg
  is_user_created: boolean;
  tracking_other?: string;
  tracking_vn?:string;
  take_photo: boolean;
  is_repacked: boolean;
  is_verify_count: boolean
}

export interface InvoiceMetadata {
  items: InvoiceItem[];
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
  user_id: number;
  fee_codes: string[]; // mảng code phụ phí, có thể rỗng
  insurance_id: number;
  category_fee_id: number;
  price: number; // giá trị đơn hàng
  product_ids: number[]; // danh sách product id
}

export interface OrderFeeRequest {
  data: {
    product_id: number;
    count: number;
    price: number;
    description: string;
    name: string;
  }[];
  fee_codes: string[];
  insurance_id: number;
  description: string;
  user_id: number;
  deposit_fee: number;
  product_category_id: number;
}

export interface FeeServiceCheck {
  fee: number;
  fee_vnd: number;
  min_deposit_percent: number;
}

export interface ApproveOrderModel {
  cod_shipping: number;
  description: string;
  product_category_id: number;
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
