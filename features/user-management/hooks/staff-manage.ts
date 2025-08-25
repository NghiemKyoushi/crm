import { getListStaffParams, getListStaffResponse, NewUserType, UserData } from "@/types/staff-manage-type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addAddressCustomer, addBankCustomer, addCustomerForSale, addCustomerNote, addDefaultAddress, addSaleStaff, createNewCateCustomer, createNewStaff, createRole, getDetailCustomer, getDetailStaff, getListCateCustomer, getListCustomers, getListCustomersNote, getListRoles, getListSaleStaff, getListStaff, updateCateCustomer, updateRole } from "../apis/staff-manage";
import { CategoryRequest, CategoryResponse, getListCateParams } from "@/types/category-customer";
import { getPagination } from "@/types/common-type";
import { AddCustomerTosaleModel, UserSaleResponse } from "@/types/sale-manage";
import { Role, RoleRequest, RoleResponse } from "@/types/roles";
import { addressModel, bankAccountModel, CustomerDetail, CustomerNoteParams, CustomerParam, CustomerResponse } from "@/types/customer-type";

export const useListStaff = (params: getListStaffParams) => {
  return useQuery<getListStaffResponse>({
    queryKey: ["listStaff", params], 
    queryFn: () => getListStaff(params),
    // keepPreviousData: true, 
  });
};

export const useDetailStaff = (id: string | null) => {
  return useQuery<NewUserType>({
    queryKey: ["detailStaff", id], // nên đưa id vào queryKey để cache riêng
    queryFn: () => getDetailStaff(id as string),
    enabled: !!id, // ✅ chỉ gọi khi có id
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

export const useUpdateCateGoryCus = () => {
  return useMutation({
    mutationFn: ({ param, id }: { param: CategoryRequest; id: string }) =>
      updateCateCustomer(param, id),
  });
};

export const useListSaleStaff = (params: getPagination) => {
  return useQuery<UserSaleResponse>({
    queryKey: ["listStaff", params], 
    queryFn: () => getListSaleStaff(params),
  });
};

export const useCreateSaleStaff = () => {
  return useMutation({
    mutationFn: (ids: string[]) =>
      addSaleStaff(ids),
  });
};


export const useListRole = () => {
  return useQuery<Role[]>({
    queryKey: ["listRole"], 
    queryFn: () => getListRoles(),
  });
};

export const useCreateNewRole = () => {
  return useMutation({
    mutationFn: (param: RoleRequest) =>
      createRole(param),
  });
};

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: ({ param, id }: { param: RoleRequest; id: string }) =>
      updateRole(param, id),
  });
};

export const useListCustomer = (params: CustomerParam) => {
  return useQuery<CustomerResponse>({
    queryKey: ["listCustomer", params], 
    queryFn: () => getListCustomers(params),
  });
};

export const useListCustomerWithSearch = (params: CustomerParam) => {
  return useQuery<CustomerResponse>({
    queryKey: ["listCustomerSearch", params], 
    queryFn: () => getListCustomers(params),
    enabled: !!params.search,
  });
};

export const useDetailCustomer = (id: string | null) => {
  return useQuery<CustomerDetail>({
    queryKey: ["detailCustomer"], 
    queryFn: () => getDetailCustomer(id as string),
    enabled: !!id
  });
};

export const useAddBank = () => {
  return useMutation({
    mutationFn: ({ data, id }: { data: bankAccountModel; id: string }) =>
      addBankCustomer(data, id),
  });
};
export const useAddAddress = () => {
  return useMutation({
    mutationFn: ({ data, id }: { data: addressModel; id: string }) =>
      addAddressCustomer(data, id),
  });
};

export const useDefaultAddress = () => {
  return useMutation({
    mutationFn: ({ address_id, id }: { address_id: number; id: string }) =>
      addDefaultAddress(address_id, id),
  });
};

export const useCustomerForSale = () => {
  return useMutation({
    mutationFn: (params: AddCustomerTosaleModel) =>
      addCustomerForSale(params),
  });
};
export const useAddNote = () => {
  return useMutation({
    mutationFn: ({ content, id }: { content: string; id: string }) =>
      addCustomerNote(content, id),
  });
};

export const useGetListNote = (params: CustomerNoteParams, id: string | null) => {
  return useQuery({
    queryKey: ["customerNotes"], 
    queryFn: () => getListCustomersNote(params, id as string),
    enabled: !!id
  });
};
