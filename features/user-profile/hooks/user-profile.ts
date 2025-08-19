import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  getUserProfile,
  updatePassword,
  updateUserProfile,
} from "@/services/user";
import { Password, UserProfile } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    // staleTime: 5 * 60 * 1000,    // cache 5 phút
  });
};

export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: (body: UserProfile) => updateUserProfile(body),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (body: Password) => updatePassword(body),
  });
}

export const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "1");
  
    const uploadRes = await api.post(API_TYPE_CONST.UPLOAD_IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log("Upload progress:", percent, "%");
        }
      },
    });
  
    const respData = uploadRes.data;
    const newId =
      respData?.data?.id ??
      respData?.data?.[0]?.id ??
      respData?.id ??
      respData?.[0]?.id;
  
    if (!newId) throw new Error("No file id returned");
  
    await api.put(API_TYPE_CONST.UPDATE_AVARTAR, {
      profile_image_id: Number(newId),
    });
  
    return newId;
  };