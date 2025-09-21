export interface InsuranceModel {
  created_at: string;
  description: string;
  fee_percentage: number;
  id: number;
  is_delete: boolean;
  max_value_vnd: number;
  name: string;
  status: string;
  updated_at: null;
}

export interface CreateModel {
  description: string;
  fee_percentage: number;
  max_value_vnd: number;
  name: string;
  status: string;
}

// Một phương thức vận chuyển (AIR, SEA, ...)
export interface ShippingMethod {
  id: number;
  method_type: "AIR" | "SEA" | string;
  duration_min: number | null;
  duration_max: number | null;
  disable: boolean;
  region_code: string;
  region_name: string;
  description: string;
  supported: boolean;
}

// Response: động theo region_code
export type ShippingMethodResponse = {
  [regionCode: string]: ShippingMethod[];
};