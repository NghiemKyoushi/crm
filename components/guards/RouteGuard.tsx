"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePermission } from '@/components/layout/PermissionContext';
import { useUserRole } from "@/features/user-profile/hooks/user-profile";
import {
  canAccessRoute,
  getRoutePermissionConfig,
  handlePermissionViolation
} from '@/utils/permissions';
import { Spin } from 'antd';

interface RouteGuardProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * Route-level permission guard that protects entire pages/routes
 * This should be used at the layout or page level
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  loading = (
    <div className="flex items-center justify-center min-h-screen">
      <Spin size="large" tip="">
        <div />
      </Spin>
    </div>
  )
}) => {
  const pathname = usePathname();
  const { permissions, loading: permissionLoading } = usePermission();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  const isAdmin = React.useMemo(() => {
    return userRole?.role_name === "ADMIN";
  }, [userRole]);

  useEffect(() => {
    if (!permissionLoading && !roleLoading && permissions && userRole) {
      const userPermissions = permissions.map(p => p.name);
      const hasAccess = canAccessRoute(userPermissions, pathname, isAdmin);

      if (!hasAccess) {
        const config = getRoutePermissionConfig(pathname);
        handlePermissionViolation(pathname, config ?? undefined);
      }
    }
  }, [pathname, permissions, permissionLoading, userRole, roleLoading, isAdmin]);

  if (permissionLoading || roleLoading) {
    return <>{loading}</>;
  }

  return <>{children}</>;
};

/**
 * Page wrapper that adds route protection to any page component
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function RouteGuardedComponent(props: P) {
    return (
      <RouteGuard>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

/**
 * Custom hook for checking route access
 */
export function useRouteAccess() {
  const pathname = usePathname();
  const { permissions, loading: permissionLoading } = usePermission();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  const isAdmin = React.useMemo(() => {
    return userRole?.role_name === "ADMIN";
  }, [userRole]);

  const hasAccess = React.useMemo(() => {
    if (permissionLoading || roleLoading || !permissions || !userRole) return undefined;

    const userPermissions = permissions.map(p => p.name);
    return canAccessRoute(userPermissions, pathname, isAdmin);
  }, [pathname, permissions, permissionLoading, userRole, roleLoading, isAdmin]);

  const config = React.useMemo(() => {
    return getRoutePermissionConfig(pathname);
  }, [pathname]);

  return {
    hasAccess,
    loading: permissionLoading || roleLoading,
    config,
    pathname,
    isAdmin
  };
}