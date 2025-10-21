// Frontend display model
export interface PackageInfo {
  id?: number;
  packageCode: string;
  trackingCode?: string;
  senderName?: string;
  sentDate?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'error';
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
  sender_name: string;
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
