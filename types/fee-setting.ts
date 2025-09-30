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

interface Item {
  id: number;
  disable: boolean;
}

export type ItemShippingList = Item[];


export type FeeCommon = { id: number; value: number };

export type GeneralPolicy = {
  id: number;
  free_storage_days: number;
  storage_fee_per_kg_per_day: number;
  min_deposit_percent: number;
};
export type ShippingZoneFee = {
  id: number;
  fee_amount: number;
  free_weight_us: number | null;
  free_weight_japan: number | null;
};

export interface FormData {
  feeCommonData: FeeCommon[];
  generalPolicy: GeneralPolicy[];
  shippingZoneFee: ShippingZoneFee[];
}

export function mapFormToData(form: Record<string, any>): FormData {
  const feeCommonData: FeeCommon[] = [];
  const shippingZoneFee: ShippingZoneFee[] = [];
  const generalPolicy: GeneralPolicy[] = [
    {
      id: 0,
      free_storage_days: 0,
      storage_fee_per_kg_per_day: 0,
      min_deposit_percent: 0,
    },
  ];

  Object.entries(form).forEach(([key, value]) => {
    if (key.startsWith("US_VN_") || key.startsWith("JP_VN_")) {
      // gom chung tất cả surcharge/service/shipping về feeCommonData
      const id = parseInt(key.split("_").pop() || "0", 10);
      feeCommonData.push({
        id,
        value: value ?? 0,
      });
    } else if (key.startsWith("zone_")) {
      // zone_1_fee, zone_1_free_us, zone_1_free_jp
      const zoneMatch = key.match(/^zone_(\d+)_(fee|free_us|free_jp)$/);
      if (zoneMatch && zoneMatch.length >= 3) {
        const [, zoneIdStr, field] = zoneMatch;
        const zoneId = parseInt(zoneIdStr, 10);

        let zone = shippingZoneFee.find((z) => z.id === zoneId);
        if (!zone) {
          zone = { id: zoneId, fee_amount: 0, free_weight_us: 0, free_weight_japan: 0 };
          shippingZoneFee.push(zone);
        }

        if (field === "fee") zone.fee_amount = value ?? 0;
        if (field === "free_us") zone.free_weight_us = value ?? null;
        if (field === "free_jp") zone.free_weight_japan = value ?? null;
      }
    } else if (key.startsWith("general_")) {
      if (!generalPolicy[0]) {
        generalPolicy[0] = { id: 0, free_storage_days: 0, storage_fee_per_kg_per_day: 0, min_deposit_percent: 0 };
      }
      if (key === "general_free_storage_days") generalPolicy[0].free_storage_days = value ?? 0;
      if (key === "general_storage_fee") generalPolicy[0].storage_fee_per_kg_per_day = value ?? 0;
      if (key === "general_deposit_percent") generalPolicy[0].min_deposit_percent = value ?? 0;
    }
  });

  return {
    feeCommonData,
    generalPolicy,
    shippingZoneFee,
  };
}

export interface ShippingCondition {
  id: number;
  name: string;
  condition: "GTE" | "LTE" | string; // tùy hệ thống có thêm loại khác thì dùng string
  condition_value: string;           // có thể parse sang number nếu cần
  surcharge: string;                 // phí phụ thu
  shipping: string | null;           // có thể null
  route_id: number;
}

export interface ShippingRoute {
  id: number;
  code: string;
  name: string;
  origin: string;
  destination: string;
  created_at: string; // ISO date
}

export interface ShippingDataItem {
  data: ShippingCondition[];
  shipping_route: ShippingRoute;
}

export interface ShippingResponse {
  data: ShippingDataItem[];
}

export interface MaterialItem {
  id: string ;
  status?: "ACTIVE" | "INACTIVE";
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  route_id: number;
  value_shipping_data: number| null;
  product_category_id: number;
  product_category_name: string;
  condition_type: "GT" | "LTE" | "GTE" | "RANGE" | string; // thêm union để type-safe
  price_from: number;
  price_to: number;
  value_data: number;
}

interface Route {
  id: number;
  code: string;
  name: string;
  origin: string;
  destination: string;
  created_at: string;
}

// Response API có dạng object key dynamic ("1", "2"...)
export type MaterialResponse = {
   route: Route;
  data: MaterialItem[] | null;
};

export type MaterialResponseArray = MaterialResponse[];


export interface ShippingConditionAdd {
  id: number;
  route_id: number;
  product_category_id: number;
  condition_type: string; 
  price_from: number;
  price_to: number;
  value_data: string;
  value_shipping_data: string;
  status?: string; 
  customer_group_id?: number;
}

export interface ShippingConditionParams {
  list: ShippingConditionAdd[];
}

export interface CategoryItem {
  id?: number;
  name: string;
  icon: string;
  description: string;
  created_at?: string;  // ISO datetime string
  updated_at?: string;  // ISO datetime string
}