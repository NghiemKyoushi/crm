'use client';

import { JSX, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/storage';
import { KEY_STORAGE } from '@/constants/storage';
import Cookies from "js-cookie";

export function WithAuth<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const { logout } = useAuth();

    useEffect(() => {
      const tokenLocal = storage.getItem(KEY_STORAGE.TOKEN);
      const tokenCookie = Cookies.get("token");

      // Nếu 1 trong 2 không còn => logout
      if (!tokenLocal || !tokenCookie) {
        logout();
        router.push("/login");
      }
    }, [router, logout]);

    return <WrappedComponent {...props} />;
  };
}
