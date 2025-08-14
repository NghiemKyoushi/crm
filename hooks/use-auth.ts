import { storage } from "@/lib/storage";
import { useUserStore } from "@/stores/user-info-store";

export const isAuthenticated = () => {
  const user = useUserStore.getState().user;
  return !!user;
};

export const useAuth = () => {
  const { user, clearUser } = useUserStore();

  const logout = async () => {
    window.location.href = "/login";
    await storage.clear();
    clearUser();
  };
  return {
    logout,
    isAuthenticated: !!user,
  };
};
