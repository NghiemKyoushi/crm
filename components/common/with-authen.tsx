'use client';

import { JSX, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KEY_STORAGE } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/storage';

export function WithAuth<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const { logout } = useAuth();

    useEffect(() => {
      const token = storage.getItem(KEY_STORAGE.TOKEN);
      const user = storage.getItem(KEY_STORAGE.USER_INFO);

      if (!token || !user) {
        logout();
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
}
