import { create } from "zustand";
import { persist } from "zustand/middleware";
import { KEY_STORAGE } from "@/constants/storage";
import { User } from "@/types/user";

type UserInfoStore = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserInfoStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: KEY_STORAGE.USER_INFO,
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
