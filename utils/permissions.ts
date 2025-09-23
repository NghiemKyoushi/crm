/**
 * Permission utilities for centralized permission checking and route protection
 */

import { notFound, redirect } from "next/navigation";

export interface PermissionConfig {
  required: string[];
  requireAll?: boolean; // true = requires ALL permissions, false = requires ANY permission
  redirectTo?: string;
  fallbackAction?: 'notFound' | 'redirect' | 'custom';
}

/**
 * Check if user has required permissions
 */
export function checkPermissions(
  userPermissions: string[],
  required: string[],
  requireAll: boolean = false
): boolean {
  if (required.length === 0) return true;

  if (requireAll) {
    return required.every(perm => userPermissions.includes(perm));
  } else {
    return required.some(perm => userPermissions.includes(perm));
  }
}

/**
 * Route permission configurations
 * Maps route paths to their required permissions
 */
export const ROUTE_PERMISSIONS: Record<string, PermissionConfig> = {
  '/dashboard': {
    required: ['dashboard.view'],
    fallbackAction: 'notFound'
  },
  '/orderhub': {
    required: ['order.view', 'order.view_all', 'order.update_status'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/finance-management': {
    required: [
      'finance.approve_topup',
      'finance.manage_debt',
      'finance.process_withdrawal',
      'finance.view_all_transactions',
      'finance.approve_topup_requests',
      'finance.process_withdrawal_requests',
      'finance.manual_topup',
      'finance.manage_bank_accounts',
      'finance.view_transaction_history'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/user-management': {
    required: ['user.view_list', 'user.categorize_customers', 'user.manage_staff_roles'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/telesales-manage': {
    required: ['telesales.manager', 'telesales.member'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/surchange': {
    required: ['product.view', 'product.create', 'product.edit', 'system.admin'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/fee-setting': {
    required: ['product.view', 'product.create', 'product.edit', 'system.admin'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/website-manage': {
    required: ['system.admin', 'system.config'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/settings': {
    required: ['system.admin', 'settings.edit'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/sales-management': {
    required: [
      'sales.manage_orders',
      'sales.view_assigned_orders',
      'sales.view_own_salary',
      'sales.view_own_commission',
      'sales.access_dashboard'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/partner-manage': {
    required: ['finance.manage_bank_accounts', 'finance.manage_bank_permissions', 'system.admin'],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  '/user-profile': {
    required: [], // No specific permissions - all authenticated users can access their profile
    fallbackAction: 'notFound'
  }
};

/**
 * Get permission config for a route
 */
export function getRoutePermissionConfig(pathname: string): PermissionConfig | null {
  // Check exact match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Check dynamic routes (e.g., /user-management/[id])
  for (const route in ROUTE_PERMISSIONS) {
    if (pathname.startsWith(route + '/')) {
      return ROUTE_PERMISSIONS[route];
    }
  }

  return null;
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  userPermissions: string[],
  pathname: string,
  isAdmin: boolean = false
): boolean {
  // Admin has access to everything
  if (isAdmin) return true;

  const config = getRoutePermissionConfig(pathname);
  if (!config) return true; // No restrictions if no config found

  return checkPermissions(userPermissions, config.required, config.requireAll);
}

/**
 * Handle permission violation based on config
 */
export function handlePermissionViolation(
  pathname: string,
  config?: PermissionConfig
): never {
  if (!config) {
    notFound();
  }

  switch (config.fallbackAction) {
    case 'redirect':
      if (config.redirectTo) {
        redirect(config.redirectTo);
      } else {
        redirect('/dashboard');
      }
      break;
    case 'custom':
      // Custom handling can be implemented here
      notFound();
      break;
    default:
      notFound();
  }
}

/**
 * Component-level permission checking utilities
 */
export const ComponentPermissions = {
  /**
   * Check if user has permission to view a component/section
   */
  canView: (
    userPermissions: string[],
    required: string | string[],
    isAdmin: boolean = false
  ): boolean => {
    if (isAdmin) return true;

    const permissions = Array.isArray(required) ? required : [required];
    return permissions.some(perm => userPermissions.includes(perm));
  },

  /**
   * Check if user has permission to perform an action
   */
  canPerform: (
    userPermissions: string[],
    required: string | string[],
    requireAll: boolean = false,
    isAdmin: boolean = false
  ): boolean => {
    if (isAdmin) return true;

    const permissions = Array.isArray(required) ? required : [required];
    return checkPermissions(userPermissions, permissions, requireAll);
  },

  /**
   * Filter items based on permissions
   */
  filterByPermission: <T extends { permission?: string | string[] }>(
    items: T[],
    userPermissions: string[],
    isAdmin: boolean = false
  ): T[] => {
    if (isAdmin) return items;

    return items.filter(item => {
      if (!item.permission) return true;

      const required = Array.isArray(item.permission) ? item.permission : [item.permission];
      return required.some(perm => userPermissions.includes(perm));
    });
  }
};

/**
 * Tab/Menu filtering utilities
 */
export const MenuUtils = {
  /**
   * Filter menu items based on permissions
   */
  filterMenuItems: <T extends { key: string; permission?: string | string[] }>(
    items: T[],
    userPermissions: string[],
    isAdmin: boolean = false
  ): T[] => {
    if (isAdmin) return items;

    return items.filter(item => {
      const config = getRoutePermissionConfig(item.key);
      if (config) {
        return checkPermissions(userPermissions, config.required, config.requireAll);
      }

      if (item.permission) {
        const required = Array.isArray(item.permission) ? item.permission : [item.permission];
        return required.some(perm => userPermissions.includes(perm));
      }

      return true;
    });
  },

  /**
   * Filter tabs based on permissions
   */
  filterTabs: <T extends { key: string; perm?: string | string[] }>(
    tabs: T[],
    userPermissions: string[],
    isAdmin: boolean = false
  ): T[] => {
    if (isAdmin) return tabs;

    return tabs.filter(tab => {
      if (!tab.perm) return true;

      const required = Array.isArray(tab.perm) ? tab.perm : [tab.perm];
      return required.some(perm => userPermissions.includes(perm));
    });
  }
};

/**
 * Permission error messages
 */
export const PermissionMessages = {
  ACCESS_DENIED: 'You do not have permission to access this resource',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  ADMIN_ONLY: 'This action is restricted to administrators only',
  ROLE_REQUIRED: 'A specific role is required to access this feature'
};