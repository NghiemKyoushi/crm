import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  getUserProfile,
  getUserRole,
  updatePassword,
  updateUserProfile,
} from "@/services/user";
import { RoleRequest } from "@/types/roles";
import { Password, UserProfile } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RoleDetail } from "../components/user-profile-form";
import Cookies from "js-cookie";
import axios from "axios";

export const useUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    // staleTime: 5 * 60 * 1000,    // cache 5 phút
  });
};
export const useUserRole = () => {
  return useQuery<RoleDetail>({
    queryKey: ["userRole"],
    queryFn: getUserRole,
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

// export const uploadAvatar = async (file: File) => {
//   const formData = new FormData();
//   formData.append("file", file); // confirm lại tên field đúng với BE
//   formData.append("type", "1");

//   const token = Cookies.get("accessToken");

//   const uploadRes = await api.post(API_TYPE_CONST.UPLOAD_IMAGE, formData, {
//     // headers: {
//     //   Authorization: token ? `Bearer ${token}` : "",
//     // },
//     onUploadProgress: (progressEvent) => {
//       if (progressEvent.total) {
//         const percent = Math.round(
//           (progressEvent.loaded * 100) / progressEvent.total
//         );
//         console.log("Upload:", percent + "%");
//       }
//     },
//   });

//   const respData = uploadRes.data;
//   const newId =
//     respData?.data?.id ??
//     respData?.data?.[0]?.id ??
//     respData?.id ??
//     respData?.[0]?.id;

//   if (!newId) throw new Error("No file id returned");

//   await api.put(API_TYPE_CONST.UPDATE_AVARTAR, {
//     profile_image_id: Number(newId),
//   });

//   return newId;
// };

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // confirm lại field đúng với BE
  formData.append("type", "1");

  const token = Cookies.get("accessToken");

  const uploadRes = await axios.post(API_TYPE_CONST.UPLOAD_IMAGE, formData, {
    baseURL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // ❌ KHÔNG ép Content-Type, axios tự set boundary
    },
    withCredentials: true,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log("Upload:", percent + "%");
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

  await axios.put(
    API_TYPE_CONST.UPDATE_AVARTAR,
    { profile_image_id: Number(newId) },
    {
      baseURL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      withCredentials: true,
    }
  );

  return newId;
};


export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // confirm lại field đúng với BE
  formData.append("type", "1");

  // Use api from axiosClient to get automatic token refresh on 401
  const uploadRes = await api.post(API_TYPE_CONST.UPLOAD_IMAGE, formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log("Upload:", percent + "%");
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

  return newId;
};