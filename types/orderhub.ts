export interface InvoiceResponse {
  data: Invoice[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  user_id: number;
  metadata: InvoiceMetadata;
  amount: number;
  amount_vnd: number;
  description: string | null;
  status: string;
  created_by: number;
  created_at: string;
  customer_name: string;
  created_by_name: string;
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
