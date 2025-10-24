// Order metadata - new structure from API v2.0.0
// Maps to OrderMetadata in backend (order.metadata.infos)
export interface OrderMetadata {
  inspection_photo_ids?: number[]; // List<Long> - IDs ảnh kiểm tra
  verify_counts?: number; // Long - Số lượng đã kiểm đếm
  is_repacked?: boolean; // Boolean - Đã đóng lại chưa
}

// Order info từ scan tracking API & Modal display
export interface OrderInfo {
  id: number;
  order_code: string;
  tracking_code: string;
  // Requirements - Boolean có thể null từ backend
  take_photo: boolean | null; // Yêu cầu chụp ảnh
  is_repacked: boolean | null; // Yêu cầu đóng lại
  is_verify_count: boolean | null; // Yêu cầu kiểm đếm
  status: string;
  metadata?: OrderMetadata | null; // Metadata chứa actual values (API v2.0.0)
  // Backward compatibility - deprecated fields
  verify_count_value?: number; // @deprecated - use metadata.verify_counts
  is_repacked_done?: boolean; // @deprecated - use metadata.is_repacked
  document_image_ids?: number[]; // @deprecated - use metadata.inspection_photo_ids
  product_image_ids?: number[]; // @deprecated - use metadata.inspection_photo_ids
  // Additional fields for order details
  admin_note?: string | null; // Ghi chú của admin
  customer_note?: string | null; // Ghi chú của khách hàng
  product_link?: string | null; // Link sản phẩm
}

// Related Order info từ check-coming API v2.0.0
// Maps exactly to backend OrderInfo DTO
export interface RelatedOrderInfo {
  order_id: number; // Long
  invoice_no: string | null; // String
  user_id: number; // Integer
  customer_name: string; // String
  status: string; // String - VD: "ARRIVED_JP_WAREHOUSE"
  amount_vnd: number; // Long
  package_code: string; // String
  created_at: string; // Instant (ISO8601 string)

  // Requirements - xác định có cần làm nhiệm vụ hay không
  // Backend: Boolean (có thể null), Frontend: boolean | null
  take_photo: boolean | null; // Yêu cầu chụp ảnh
  is_repacked: boolean | null; // Yêu cầu đóng lại
  is_verify_count: boolean | null; // Yêu cầu kiểm đếm

  // Metadata object chứa actual values
  metadata?: OrderMetadata | null; // OrderMetadata - Thông tin thực tế đã thực hiện

  // Additional fields for order details
  admin_note?: string | null; // Ghi chú của admin
  customer_note?: string | null; // Ghi chú của khách hàng
  product_link?: string | null; // Link sản phẩm
}

// Upload image response
export interface UploadImageResponse {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string | null;
  type: string;
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
