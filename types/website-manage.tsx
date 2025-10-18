export interface WebsiteParams {
  page?: number;
  regionId?: number;
  search?: string;
  size?: number;
}

export interface Region {
  id: number;
  name: string;
  code: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Selector Config - Định nghĩa cách extract data từ HTML
export interface SelectorConfig {
  selector: string;           // CSS selector
  attribute?: string;         // text|html|src|href (default: "text")
  transform?: string;         // removeNonDigits|trim|lowercase|uppercase
  multiple?: boolean;         // Extract multiple elements (default: false)
  selectLast?: boolean;       // Select last element (default: false)
  selectIndex?: number;       // Select specific index
}

// Crawl Config - Một bộ selectors cho một layout/version của website
export interface CrawlConfig {
  name: string;                              // "Yahoo Auction v1 (Current - Dec 2024)"
  priority: number;                          // 1 = highest priority
  selectors: {
    productName?: SelectorConfig;
    price?: SelectorConfig;
    quantity?: SelectorConfig;
    images?: SelectorConfig;
    description?: SelectorConfig;
  };
}

export interface AddWebsiteModel {
  domain: string;
  name: string;
  region_id: number;
  currency_code: string;
  route_id: string;
  selector_configs?: CrawlConfig[];          // Multiple configs per website
  cache_duration_hours?: number;             // Cache TTL (default: 12)
  proxy_enabled?: boolean;                   // Enable proxy for crawling
  proxy_host?: string;                       // Proxy server host
  proxy_port?: string;                       // Proxy server port
  proxy_username?: string;                   // Proxy authentication username
  proxy_password?: string;                   // Proxy authentication password
}

export interface Website {
  id: number;
  name: string;
  domain: string;
  region_id: number;
  currency_code?: string;
  route_id?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  region: Region;
  selector_configs?: CrawlConfig[];          // Multiple configs per website
  cache_duration_hours?: number;             // Cache TTL (default: 12)
  proxy_enabled?: boolean;                   // Enable proxy for crawling
  proxy_host?: string;                       // Proxy server host
  proxy_port?: string;                       // Proxy server port
  proxy_username?: string;                   // Proxy authentication username
  proxy_password?: string;                   // Proxy authentication password (masked in response)
}

export interface WebsiteListResponse {
  data: Website[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface Country {
    id: number;
    name: string;
    code: string;
    is_deleted: boolean;
    created_at: string; 
    updated_at: string; 
  }
  
  export interface CountryResponse {
    data: Country[];
  }

// Request body cho update selector configs
export interface UpdateSelectorConfigRequest {
  cache_duration_hours: number;
  selector_configs: CrawlConfig[];
}

// Test selector config request
export interface TestSelectorConfigRequest {
  url: string;
  configs: CrawlConfig[];
}

// Test result for a single config
export interface TestConfigResult {
  config_name: string;
  priority: number;
  success: boolean;
  extraction_score: number;
  error_message: string | null;
  extracted_data: {
    product_name: string | null;
    price: number | null;
    quantity: number | null;
    images: string[] | null;
    description: string | null;
  };
}

// Test selector config response
export interface TestSelectorConfigResponse {
  url: string;
  best_config: string;
  best_score: number;
  execution_time_ms: number;
  test_results: TestConfigResult[];
}
