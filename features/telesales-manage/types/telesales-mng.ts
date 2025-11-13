export interface TelesaleParamsList {
    page?: number;
    pageSize?: number;
    saleId?: string;
    search?: string;
    status?: string;
}
export interface TelesaleCustomer {
    id: number;
    name: string;
    address: string | null;
    source: string;
    status: string;
    created_at: string;
    saleId: string | null;
    phone: string;
    gender: string;
    dateOfBirth: string;
    saleGender: string | null;
    dateOfBirthSale: string | null;
    emailSale: string | null;
    saleName: string | null;
    notes: Array<any>;
    tags: Array<any>;

}

export interface TelesaleCustomerListResponse {
    data: TelesaleCustomer[];
    total_pages: number;
    total_items: number;
    current_page: number;
    page_size: number;
    totals: any | null;
}
export interface AssignSaleModel {
    note: string;
    prospect_ids: number[];
    sale_id: number;
}
