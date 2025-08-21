import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { getListStaffParams, NewUserType } from "@/types/staff-manage-type";



export const getListStaff  = async (params: getListStaffParams) => {  
  const res = await api.get(API_TYPE_CONST.LIST_STAFF, {params});
  return res.data; 
}

export const createNewStaff  = async (params: NewUserType) => {  
  const res = await api.post(API_TYPE_CONST.ADD_STAFF, params);
  return res.data; 
}
