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
 * Maps route paths to their required permissions based on the comprehensive permission system
 */
export const ROUTE_PERMISSIONS: Record<string, PermissionConfig> = {
  // Dashboard
  '/dashboard': {
    required: ['dashboard.view'],
    fallbackAction: 'notFound'
  },

  // Order Management
  '/orderhub': {
    required: [
      'order.view',
      'order.view_all',
      'order.create',
      'order.edit',
      'order.delete',
      'order.update_status',
      'order.cancel',
      'sales.manage_orders',
      'sales.view_assigned_orders',
       "sales.view_assigned_orders", "sales.create_order_for_customers"
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Financial Management
  '/finance-management': {
    required: [
      'finance.approve_topup',
      'finance.process_withdrawal',
      'finance.view_all_transactions',
      'finance.manage_debt',
      'finance.view_bank_usage_stats',
      'finance.restore_transactions',
      'finance.process_withdrawal_requests',
      'finance.approve_topup_requests',
      'finance.manual_topup',
      'finance.manage_bank_accounts',
      'finance.view_transaction_history',
      'finance.manage_bank_permissions'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // User Management
  '/user-management': {
    required: [
      'user.view',
      'user.create',
      'user.edit',
      'user.delete',
      'user.view_list',
      'user.categorize_customers',
      'user.manage_staff_roles',
      'role.view',
      'role.create',
      'role.edit',
      'role.delete',
      'role.assign',
      'permission.view',
      'permission.create',
      'permission.edit',
      'permission.delete',
      'permission.assign',
      'sales.manage_assigned_customers'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Telesales Management
  '/telesales-manage': {
    required: ['telesales.manager', 'telesales.member'],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Product Management (Surcharge)
  '/surchange': {
    required: [
      'product.view',
      'product.create',
      'product.edit',
      'product.delete',
      'system.admin',
      'system.config'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Fee Setting
  '/fee-setting': {
    required: [
      'product.view',
      'product.create',
      'product.edit',
      'product.delete',
      'system.admin',
      'system.config',
      'settings.edit'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Website Management
  '/website-manage': {
    required: [
      'system.admin',
      'system.config',
      'system.logs',
      'system.backup'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // System Settings
  '/settings': {
    required: [
      'system.admin',
      'system.config',
      'settings.edit'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },
  // Shipment management
  '/shipment-management': {
    required: [
      'system.admin',
      'system.config',
      "sales.view_assigned_shipments", "sales.create_shipments"

    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Sales Management & Auctions
  '/sales-management': {
    required: [
      'sales.manage_orders',
      'sales.view_assigned_orders',
      'sales.update_order_status',
      'sales.create_order_for_customers',
      'sales.manage_auctions',
      'sales.create_auction',
      'sales.update_auction',
      'sales.view_auction_results',
      'sales.manage_bids',
      'sales.view_own_salary',
      'sales.view_own_commission',
      'sales.view_own_performance',
      'sales.access_dashboard',
      'sales.view_sales_reports',
      'sales.export_sales_data',
      'sales.view_assigned_customers',
      'sales.manage_assigned_customers',
      'sales.update_customer_info',
      'sales.add_customer_notes',
      'sales.view_customer_orders'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Partner Management (Banking)
  '/partner-manage': {
    required: [
      'finance.manage_bank_accounts',
      'finance.manage_bank_permissions',
      'finance.view_bank_usage_stats',
      'system.admin'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Reports & Analytics
  '/reports': {
    required: [
      'report.view',
      'report.create',
      'report.export',
      'audit.view',
      'audit.export'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Audit Logs
  '/audit': {
    required: [
      'audit.view',
      'audit.export',
      'system.logs'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // System Administration
  '/system': {
    required: [
      'system.admin',
      'system.logs',
      'system.config',
      'system.backup'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // User Profile (accessible to all authenticated users)
  '/user-profile': {
    required: [], // No specific permissions - all authenticated users can access their profile
    fallbackAction: 'notFound'
  },

  // Personal Sales Dashboard (for sales staff)
  '/my-sales': {
    required: [
      'sales.view_own_salary',
      'sales.view_own_commission',
      'sales.view_own_performance',
      'sales.access_dashboard'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Dynamic routes for sales management
  '/sales-management/[id]': {
    required: [
      'sales.manage_orders',
      'sales.view_assigned_orders',
      'sales.update_order_status',
      'sales.create_order_for_customers',
      'sales.manage_assigned_customers',
      'sales.view_customer_orders',
      'sales.access_dashboard'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Dynamic routes for user management
  '/user-management/[id]': {
    required: [
      'user.view',
      'user.edit',
      'user.delete',
      'user.categorize_customers',
      'user.manage_staff_roles',
      'role.view',
      'role.edit',
      'role.assign'
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Check Coming - Warehouse
  '/check-coming': {
    required: [
      'warehouse.check_coming_wh1',
      'system.admin',
    ],
    requireAll: false,
    fallbackAction: 'notFound'
  },

  // Public routes (no authentication required)
  '/login': {
    required: [],
    fallbackAction: 'notFound'
  },

  '/forgot-password': {
    required: [],
    fallbackAction: 'notFound'
  },
  '/cms':{
    required: [
      '"cms.view_screen", "cms.edit_screen"',
      'system.admin',
    ],
    requireAll: false,
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
    // Handle dynamic route patterns
    if (route.includes('[id]')) {
      const baseRoute = route.replace('/[id]', '');
      const regex = new RegExp(`^${baseRoute}/[^/]+$`);
      if (regex.test(pathname)) {
        return ROUTE_PERMISSIONS[route];
      }
    }

    // Check for sub-paths (existing functionality)
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
  // Admin has access to everything except public routes
  if (isAdmin) return true;

  const config = getRoutePermissionConfig(pathname);

  // No restrictions if no config found (allows access to unknown routes)
  if (!config) return true;

  // If no permissions required, allow access (public routes)
  if (config.required.length === 0) return true;

  // Check if user has required permissions
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
  },

  /**
   * Check if user has any permissions from a group
   */
  hasAnyFromGroup: (
    userPermissions: string[],
    groupName: string,
    isAdmin: boolean = false
  ): boolean => {
    if (isAdmin) return true;

    return userPermissions.some(perm => perm.startsWith(`${groupName}.`));
  },

  /**
   * Get user's permissions for a specific group
   */
  getGroupPermissions: (
    userPermissions: string[],
    groupPrefix: string
  ): string[] => {
    return userPermissions.filter(perm => perm.startsWith(`${groupPrefix}.`));
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