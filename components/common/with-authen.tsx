'use client';

import { JSX, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/storage';
import { KEY_STORAGE } from '@/constants/storage';

export function WithAuth<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const { logout } = useAuth();

    useEffect(() => {
      const token = storage.getItem(KEY_STORAGE.TOKEN);
      if (!token) {
        logout();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    return <WrappedComponent {...props} />;
  };
}
