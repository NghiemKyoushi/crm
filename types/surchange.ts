export interface SurchangeItem {
    condition_type?: string;
    created_at?: string;
    created_by?: number;
    fee_percentage?: number;
    id?: number;
    price_from?: number;
    price_to?: number;
    product_category_id?: number;
    product_category_name?: string;
    region_code?: string;
    region_id?: number;
    region_name?: string;
    status?: string;
    updated_at?: string;
    updated_by?: number;
}

export interface ParamCreateSurchangeModel {
    condition_type: string;
    fee_percentage: number;
    price_from: number;
    price_to: number;
    product_category_id: number;
    region_id: number;
    route_id: number;
    status: string;
}