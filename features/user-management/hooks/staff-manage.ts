import { getListStaffParams, getListStaffResponse, NewUserType, UserData } from "@/types/staff-manage-type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createNewCateCustomer, createNewStaff, getListCateCustomer, getListRoles, getListSaleStaff, getListStaff } from "../apis/staff-manage";
import { CategoryRequest, CategoryResponse, getListCateParams } from "@/types/category-customer";
import { getPagination } from "@/types/common-type";
import { UserSaleResponse } from "@/types/sale-manage";
import { Role, RoleResponse } from "@/types/roles";

export const useListStaff = (params: getListStaffParams) => {
  return useQuery<getListStaffResponse>({
    queryKey: ["listStaff", params], 
    queryFn: () => getListStaff(params),
    // keepPreviousData: true, 
  });
};

export const useCreateNewStaff = () => {
  return useMutation({
    mutationFn: (param: NewUserType) =>
      createNewStaff(param),
  });
};

export const useListCateGoryCus = (params: getListCateParams) => {
  return useQuery<CategoryResponse>({
    queryKey: ["listCate", params], 
    queryFn: () => getListCateCustomer(params),
  });
};

export const useCreateNewCateGoryCus = () => {
  return useMutation({
    mutationFn: (param: CategoryRequest) =>
      createNewCateCustomer(param),
  });
};

export const useListSaleStaff = (params: getPagination) => {
  return useQuery<UserSaleResponse>({
    queryKey: ["listStaff", params], 
    queryFn: () => getListSaleStaff(params),
  });
};

export const useListRole = () => {
  return useQuery<Role[]>({
    queryKey: ["listRole"], 
    queryFn: () => getListRoles(),
  });
};

