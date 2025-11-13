"use client";

import React from 'react';
import { usePermission } from '@/components/layout/PermissionContext';
import { ComponentPermissions } from '@/utils/permissions';
import { Spin, Result } from 'antd';

interface PermissionGuardProps {
  children: React.ReactNode;
  required: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  showError?: boolean;
}

/**
 * Component wrapper that conditionally renders children based on permissions
 *
 * @param children - Content to render if user has permission
 * @param required - Required permission(s) as string or array
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @param fallback - Custom component to render when permission is denied
 * @param loading - Custom loading component
 * @param showError - Whether to show error message when permission denied
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  required,
  requireAll = false,
  fallback = null,
  loading = <Spin tip="Checking permissions..." />,
  showError = false
}) => {
  const { permissions, loading: permissionLoading } = usePermission();

  if (permissionLoading) {
    return <>{loading}</>;
  }

  const userPermissions = permissions.map(p => p.name);
  const hasPermission = ComponentPermissions.canPerform(
    userPermissions,
    required,
    requireAll
  );

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this resource."
          extra={null}
        />
      );
    }

    return null;
  }

  return <>{children}</>;
};

/**
 * HOC version of PermissionGuard for wrapping components
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  required: string | string[],
  requireAll: boolean = false
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard required={required} requireAll={requireAll}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Hook for permission checking in components
 */
export function usePermissionCheck() {
  const { permissions, hasPermission, loading } = usePermission();

  return {
    permissions,
    loading,
    hasPermission,

    /**
     * Check if user can view something
     */
    canView: (required: string | string[]) => {
      const userPermissions = permissions.map(p => p.name);
      return ComponentPermissions.canView(userPermissions, required);
    },

    /**
     * Check if user can perform an action
     */
    canPerform: (required: string | string[], requireAll: boolean = false) => {
      const userPermissions = permissions.map(p => p.name);
      return ComponentPermissions.canPerform(userPermissions, required, requireAll);
    },

    /**
     * Filter array items based on permissions
     */
    filterByPermission: <T extends { permission?: string | string[] }>(items: T[]) => {
      const userPermissions = permissions.map(p => p.name);
      return ComponentPermissions.filterByPermission(items, userPermissions);
    }
  };
}