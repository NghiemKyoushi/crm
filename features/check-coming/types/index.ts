// Order info từ scan tracking API
export interface OrderInfo {
  id: number;
  order_code: string;
  tracking_code: string;
  take_photo: boolean;
  is_repacked: boolean;
  is_verify_count: boolean;
  status: string;
  // Add more fields as needed
}

// Related Order info từ check-coming API v2.0.0
export interface RelatedOrderInfo {
  order_id: number;
  invoice_no: string | null;
  user_id: number;
  customer_name: string;
  status: string;
  amount_vnd: number;
  package_code: string;
  created_at: string;
}

// Scan tracking response - có thể trả về nhiều orders
export interface ScanTrackingResponse {
  tracking_code: string;
  orders: OrderInfo[];
  message?: string;
}

// Frontend display model
export interface PackageInfo {
  id?: number;
  packageCode: string;
  trackingCode?: string;
  senderName?: string;
  sentDate?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'error';
  orders?: OrderInfo[]; // Danh sách orders từ scan tracking
  code?: string; // Mã code để tạo barcode (F000001, F000002, ...)
  relatedOrders?: RelatedOrderInfo[]; // Danh sách related orders từ check-coming API v2.0.0
}

export interface ScanResult {
  code: string;
  type: 'qr' | 'barcode' | 'manual';
  timestamp: string;
}

// API request/response models (snake_case to match backend)
export interface CheckComingCreateRequest {
  package_code: string;
  tracking_code: string;
  sent_date: string;
  status?: number;
}

export interface CheckComingRecord {
  id: number;
  package_code: string;
  tracking_code: string;
  sender_name: string;
  sent_date: string;
  status: number;
  created_at: string;
  updated_at: string;
  code?: string; // Mã code để tạo barcode (API v2.0.0)
  related_orders?: RelatedOrderInfo[]; // Danh sách related orders (API v2.0.0)
}

export interface CheckComingListResponse {
  content: CheckComingRecord[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
