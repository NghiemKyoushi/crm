import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  AssignSaleModel,
  TelesaleParamsList,
  TelesaleCustomerFormInput,
} from "../types/telesales-mng";

// Lấy danh sách account telesale
export const getTelesaleAccounts = async (page: number = 1, size: number = 100) => {
  const res = await api.get(API_TYPE_CONST.TELESALE_ACCOUNT, {
    params: {
      page,
      size,
    },
  });
  return res.data.data;
};

// Lấy danh sách telesale (contact)
export const getListTelesale = async (params: TelesaleParamsList) => {
  const res = await api.post(API_TYPE_CONST.TELESALES_LIST, params);
  return res.data.data;
};

// Import khách hàng telesale (qua file excel)
export const importTelesaleCustomers = async (data: FormData) => {
  const res = await api.post(API_TYPE_CONST.TELESALES_IMPORT, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Download file excel ví dụ import
export const downloadTelesaleExample = async () => {
  const res = await api.get(API_TYPE_CONST.TELESALES_DOWNLOAD_EXAMPLE, {
    responseType: "blob",
  });
  return res.data;
};

// Lấy dashboard telesale
export const getTelesaleDashboard = async () => {
  const res = await api.get(API_TYPE_CONST.DASHBOARD_TELESALE);
  return res.data.data;
};

// Ghi chú cho khách hàng telesale
export const addTelesaleNote = async (body: {
  customerId: number;
  notes: string;
  saleId: number;
}) => {
  const bodySend = {
    customer_id: body.customerId,
    notes: body.notes,
    sale_id: body.saleId,
  };
  const res = await api.post(API_TYPE_CONST.TELESSALE_ADD_NOTE, bodySend);
  return res.data;
};

// Thêm thẻ phân loại telesale
export const addTelesaleTag = async (data: any) => {
  const res = await api.post(API_TYPE_CONST.TELESSALE_ADD_TAG, data);
  return res.data;
};

// Cập nhật thẻ telesale
export const updateTelesaleTag = async (
  id: string,
  data: { name: string; color: string }
) => {
  const res = await api.put(
    `${API_TYPE_CONST.TELESSALE_UPDATE_TAG}${id}`,
    data
  );
  return res.data;
};

// Xóa thẻ telesale
export const deleteTelesaleTag = async (id: string) => {
  const res = await api.delete(`${API_TYPE_CONST.TELESSALE_DELETE_TAG}${id}`);
  return res.data;
};

// Gán telesale cho khách hàng (assign)
export const assignTelesale = async (body: AssignSaleModel) => {
  const res = await api.post(API_TYPE_CONST.TELESSALE_ASSIGN, body);
  return res.data;
};

// Gán thẻ cho telesale contact
export const assignTelesaleTag = async (
  contactId: string,
  tagIds: number[]
) => {
  const url = API_TYPE_CONST.TELESSALE_ASSIGN_TAG.replace(
    "{contact_id}",
    contactId
  );
  const res = await api.post(url, tagIds);
  return res.data;
};
// Unassign
export const unassignTelesaleTag = async (contactId: string) => {
  const url = API_TYPE_CONST.TELESALE_UNASSIGN.replace(
    "{contact_id}",
    contactId
  );
  const res = await api.put(url);
  return res.data;
};

// Xoá nhiều tag khỏi telesale contact (API mới)
export const deleteTelesaleContactTags = async (
  contactId: string,
  tagIds: number[]
) => {
  const url = API_TYPE_CONST.TELESSALE_ASSIGN_TAG.replace(
    "{contact_id}",
    contactId
  );
  // Gửi body gồm id (contactId) và tags: array[string]
  const res = await api.delete(url, { data: tagIds });
  return res.data;
};

// Đổi trạng thái telesale contact
export const changeTelesaleStatus = async (
  contactId: string,
  params: { status: string; note: string }
) => {
  const url = API_TYPE_CONST.TELESSALE_CHANGE_STATUS.replace(
    "{contact_id}",
    contactId
  );
  const res = await api.put(url, null, { params }); // chuyển status vào param
  return res.data;
};

// Unassign telesale contact
export const unassignTelesaleContact = async (contactId: string) => {
  const url = API_TYPE_CONST.TELESALE_UNASSIGN.replace(
    "{contact_id}",
    contactId
  );
  const res = await api.put(url);
  return res.data;
};

// Lấy danh sách tag (thẻ) telesale
export const getTelesaleTagList = async (page?: number, pageSize?: number) => {
  // If page or pageSize is undefined, they will be omitted from params
  const params: any = {};
  if (page !== undefined) params.page = page;
  if (pageSize !== undefined) params.pageSize = pageSize;
  const res = await api.get(API_TYPE_CONST.TAG_LIST, { params });
  return res.data.data;
};

export const getTelesaleTagFilter = async (type: string) => {
  const res = await api.get(
    `${API_TYPE_CONST.TELESALE_TAG_FILTER}?type=${type}`
  );
  return res.data.data;
};

export const addTelesaleCustomer = async (data: TelesaleCustomerFormInput) => {
  const dataCheck = {
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    business_field: data.business_field,
    customer_info: data.customer_info,
    service_tag_id: data.service_tag ? Number(data.service_tag) : null,
    source_tag_id: data.source_tag ? Number(data.source_tag) : null,
    status_tag_id: null,
    note_request: data.note_request,
    call_note: data.call_note,
  };
  const res = await api.post(API_TYPE_CONST.TELESALE_ADD_CUSTOMER, dataCheck);
  return res.data;
};

export const updateTelesaleCustomer = async (
  id: number,
  data: {
    email?: string;
    address?: string;
    business_field?: string;
    customer_info?: string;
  }
) => {
  const url = API_TYPE_CONST.TELESALE_CONTACT_UPDATE.replace(
    "{id}",
    id.toString()
  );
  const res = await api.put(url, data);
  return res.data;
};

export const telesalesMngApi = {
  getTelesaleAccounts,
  getList: getListTelesale,
  import: importTelesaleCustomers,
  downloadExample: downloadTelesaleExample,
  getDashboard: getTelesaleDashboard,
  addNote: addTelesaleNote,
  addTag: addTelesaleTag,
  updateTag: updateTelesaleTag,
  deleteTag: deleteTelesaleTag,
  assign: assignTelesale,
  assignTag: assignTelesaleTag,
  deleteContactTags: deleteTelesaleContactTags,
  changeStatus: changeTelesaleStatus,
  unassign: unassignTelesaleContact,
  getTagList: getTelesaleTagList,
  addTelesaleCustomer,
  updateTelesaleCustomer,
};
