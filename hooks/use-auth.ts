import { storage } from "@/lib/storage";
// import { useUserStore } from "@/stores/user-info-store";

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false; // tránh lỗi SSR
  const accessToken = localStorage.getItem("accessToken");
  return !!accessToken;
};

export const useAuth = () => {

  const logout = async () => {
    window.location.href = "/login";
    await storage.clear();
  };
  return {
    logout,
    isAuthenticated: isAuthenticated,
  };
};
