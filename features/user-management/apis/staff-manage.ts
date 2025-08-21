import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { CategoryRequest, getListCateParams } from "@/types/category-customer";
import { getPagination } from "@/types/common-type";
import { getListStaffParams, NewUserType } from "@/types/staff-manage-type";

export const getListStaff = async (params: getListStaffParams) => {
  const res = await api.get(API_TYPE_CONST.LIST_STAFF, { params });
  return res.data;
};

export const createNewStaff = async (params: NewUserType) => {
  const res = await api.post(API_TYPE_CONST.ADD_STAFF, params);
  return res.data;
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


export const getListSaleStaff = async (params: getPagination) => {
  const res = await api.get(API_TYPE_CONST.LIST_SALE, { params });
  return res.data.data;
};

export const getListRoles = async () => {
  const res = await api.get(API_TYPE_CONST.ROLES);  
  return res.data.data;
};