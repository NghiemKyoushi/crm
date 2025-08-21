import { getListStaffParams, getListStaffResponse, NewUserType, UserData } from "@/types/staff-manage-type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createNewStaff, getListStaff } from "../apis/staff-manage";

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