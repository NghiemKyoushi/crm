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
export interface AddWebsiteModel {
  domain: string;
  name: string;
  region_id: number;
  currency_code: string;
  route_id: string;
}

export interface Website {
  id: number;
  name: string;
  domain: string;
  region_id: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  region: Region;
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
  