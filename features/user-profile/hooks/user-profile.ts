import {
  getUserProfile,
  updatePassword,
  updateUserProfile,
} from "@/services/user";
import { UserProfile } from "@/types/user";
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
    mutationFn: (body: UserProfile) => updatePassword(body),
  });
}
