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
  | "READY_TO_SHIP" | "ORDER_DELIVERED";

export enum OrderStatusType {
  PENDING = "PENDING", // Đợi duyệt
  DEPOSIT_RECEIVED = "DEPOSIT_RECEIVED", // Đã nhận đặt cọc
  ORDER_CONFIRMED = "ORDER_CONFIRMED", // Đơn hàng đã được xác nhận
  ITEM_PURCHASED = "ITEM_PURCHASED", // Đã mua hàng
  ITEM_PURCHASED_SUCCESSFULLY = "ITEM_PURCHASED_SUCCESSFULLY", // Mua hàng thành công
  ITEM_IN_JAPAN_WAREHOUSE = "ITEM_IN_JAPAN_WAREHOUSE", // Hàng ở kho Nhật
  ITEM_IN_TRANSIT_TO_VIETNAM = "ITEM_IN_TRANSIT_TO_VIETNAM", // Hàng đang vận chuyển về Việt Nam
  ITEM_ARRIVED_VIETNAM_WAREHOUSE = "ITEM_ARRIVED_VIETNAM_WAREHOUSE", // Hàng đã về kho Việt Nam
  READY_FOR_DELIVERY = "READY_FOR_DELIVERY", // Hàng sẵn sàng giao
  ORDER_DELIVERED = "ORDER_DELIVERED", // Đơn hàng đã được giao
}


export interface Invoice {
  id: number;
  invoice_no: string;
  user_id: number;
  metadata: InvoiceMetadata;
  amount: number;        // Tổng đơn hàng
  amount_vnd: number;    // Tổng theo VND
  deposit_amount?: number;  // Số tiền đặt cọc
  remain_amount?: number;   // Số tiền còn lại
  description: string | null;
  status: string;
  created_by: number;
  created_at: string;
  customer_name: string;
  created_by_name: string;

  // Fake fields để map UI
  customer_code?: string;  // SC244
  product_name?: string;   // iPhone 15 Pro Max
  source?: string;         // Amazon JP
  purchase_type?: string;  // Mua thẳng / Đấu giá
  tracking_code?: string;  // JP1234567890
  weight?: string;         // 2.1kg
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
  }[];
  fee_codes: string[];
  insurance_id: number;
  description: string;
  user_id: number;
  deposit_fee: number;
  category_product_id: number;
}

export interface FeeServiceCheck {
  fee: number,
  fee_vnd: number,
  min_deposit_percent: number
}
