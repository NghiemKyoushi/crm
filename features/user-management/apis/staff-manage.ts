import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { CategoryRequest, getListCateParams } from "@/types/category-customer";
import { getPagination } from "@/types/common-type";
import { addressModel, bankAccountModel, CustomerNoteParams, CustomerParam } from "@/types/customer-type";
import { Permission, PermissionGroup, RoleRequest } from "@/types/roles";
import { AddCustomerTosaleModel } from "@/types/sale-manage";
import { getListStaffParams, NewUserType } from "@/types/staff-manage-type";

export const getListStaff = async (params: getListStaffParams) => {
  const res = await api.get(API_TYPE_CONST.LIST_STAFF, { params });
  return res.data.data;
};

export const createNewStaff = async (params: NewUserType) => {
  const res = await api.post(API_TYPE_CONST.ADD_STAFF, {
    ...params,
    active: params.active ? "true" : "false",
  });
  return res.data;
};

export const updateStaff = async (params: NewUserType, id:string) => {
  const res = await api.put(`${API_TYPE_CONST.ADD_STAFF}/${id}`, {
    ...params,
    active: params.active ? "true" : "false",
  });
  return res.data;
};

export const getDetailStaff = async (id: string) => {
  const res = await api.get(`${API_TYPE_CONST.ADD_STAFF}/${id}`);
  return res.data.data;
};

export const getListCateCustomer = async (params: getListCateParams) => {
  const res = await api.get(API_TYPE_CONST.LIST_CATEGORY, { params });
  return res.data.data;
};

export const createNewCateCustomer = async (params: CategoryRequest) => {
  const res = await api.post(API_TYPE_CONST.LIST_CATEGORY, {
    ...params,
    cancellation_fee: 0,
    service_fee_percentage: 0,
    deposit_percentage: 0,
  });
  return res.data;
};

export const updateCateCustomer = async (params: CategoryRequest, id: string) => {
  const res = await api.put(`${API_TYPE_CONST.LIST_CATEGORY}/${id}`, {
    ...params,
    // cancellation_fee: 0,
    // service_fee_percentage: 0,
    // deposit_percentage: 0,
  });
  return res.data;
};

export const updateCateforCustomer = async (category_id: number, id: number) => {
  const res = await api.put(
    `${API_TYPE_CONST.UPDATE_CATE_FOR_CUSTOMER}${id}?group_id=${category_id}`
  );
  return res.data;
};

export const deleteCateCustomer = async ( id: string) => {
  const res = await api.delete(`${API_TYPE_CONST.LIST_CATEGORY}/${id}`);
  return res.data;
};

export const getListSaleStaff = async (params: getPagination) => {
  const res = await api.get(API_TYPE_CONST.LIST_SALE, { params });
  return res.data.data;
};

export const addSaleStaff = async (ids: string[] ) => {
  const res = await api.post(API_TYPE_CONST.CREATE_SALE, { ids });
  return res.data.data;
};

export const getListRoles = async () => {
  const res = await api.get(API_TYPE_CONST.ROLES);
  return res.data.data;
};

export const createRole = async (body: RoleRequest) => {
  const res = await api.post(API_TYPE_CONST.ROLES, body);
  return res.data.data;
};

export const updateRole = async (body: RoleRequest, id: string) => {
  const res = await api.put(`${API_TYPE_CONST.ROLES}/${id}`, body);
  return res.data.data;
};


export const getListRoleGroup = async () => {
  const res = await api.get(API_TYPE_CONST.PERMISSION_GROUP);
  return res.data;
};

export const getListPermiss = async () => {
  const res = await api.get(API_TYPE_CONST.PERMISSION);  
  return res.data.data;
};

export const addAddressCustomer = async (body: addressModel, id:string) => {
  const res = await api.post(`${API_TYPE_CONST.ADD_ADDRESS}${id}`, body);
  return res.data.data;
};

export const addDefaultAddress = async (address_id: number, id:string) => {
  const res = await api.put(`${API_TYPE_CONST.ADD_DEFAULT_ADDRESS}${id}`, {address_id});
  return res.data.data;
};

export const addDefaultBank = async (bank_id: number, id:string) => {
  const res = await api.put(`${API_TYPE_CONST.ADD_DEFAULT_BANK}${id}`, {bank_id});
  return res.data.data;
};

export const addBankCustomer = async (body: bankAccountModel, id:string) => {
  const res = await api.post(`${API_TYPE_CONST.ADD_ACCOUNT_BANK}${id}`, body);
  return res.data.data;
};

export const addCustomerNote = async (content: string, id: string ) => {
  const res = await api.post(`${API_TYPE_CONST.ADD_CUSTOMER_NOTE}${id}`, {content});
  return res.data.data;
};
export const getListCustomersNote= async (params:CustomerNoteParams,id: string) => {
  const res = await api.get(`${API_TYPE_CONST.CUSTOMER_NOTE}${id}`, {params});
  return res.data.data;
};
export const getListCustomers= async (params: CustomerParam) => {
  const res = await api.get(API_TYPE_CONST.CUSTOMER_LIST, {params});
  return res.data.data;
};

export const getDetailCustomer= async (id: string) => {
  const res = await api.get(`${API_TYPE_CONST.CUSTOMER_LIST}/${id}`);
  return res.data.data;
};

export const addCustomerForSale = async (body: AddCustomerTosaleModel ) => {
  const res = await api.post(`${API_TYPE_CONST.ADD_SALE_RESPONSIBILITY}`, body);
  return res.data.data;
};

export const removeAssignCustomerForSale = async (id: string ) => {
  const res = await api.get(`${API_TYPE_CONST.REMOVE_ASSIGN}${id}`);
  return res.data.data;
};

export const deleteAcount = async (id: string ) => {
  const res = await api.delete(`${API_TYPE_CONST.DELETE_ACCOUNT}${id}`);
  return res.data.data;
};

export const lockAcount = async (id: string ) => {
  const res = await api.put(`${API_TYPE_CONST.LOCK_ACCOUNT}${id}`);
  return res.data.data;
};

export const unlockAcount = async (id: string ) => {
  const res = await api.put(`${API_TYPE_CONST.UNLOCK_ACCOUNT}${id}`);
  return res.data.data;
};

export const resetPassAccount = async (id: string ) => {
  const res = await api.put(`${API_TYPE_CONST.RESET_PASSWORD}${id}`);
  return res.data.data;
};

export function groupPermissions(permissions?: Permission[]): PermissionGroup[] {
  if (!Array.isArray(permissions)) return [];

  const map: Record<string, Permission[]> = {};

  permissions.forEach((p) => {
    const category = p.category || "UNCATEGORIZED";
    if (!map[category]) map[category] = [];
    map[category].push(p);
  });

  return Object.entries(map).map(([category, items]) => ({
    category,
    permissions: items,
  }));
}
export function renderCategoryName(code: string) {
  switch (code) {
    case "ORDER_MANAGEMENT":
      return "Quản lý Đơn hàng";
    case "FINANCIAL_MANAGEMENT":
    case "FINANCE":
      return "Quản lý Tài chính";
    case "USER_MANAGEMENT":
      return "Quản lý Người dùng";
    case "SYSTEM_ADMIN":
    case "SYSTEM_SETTINGS":
      return "Cài đặt Hệ thống";
    default:
      return code;
  }
}