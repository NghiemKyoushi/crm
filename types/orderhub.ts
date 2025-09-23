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
  | "READY_TO_SHIP" |"ORDER_DELIVERED";


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
  status: OrderStatus;
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
