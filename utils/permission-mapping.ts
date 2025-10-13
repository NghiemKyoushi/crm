/**
 * Central mapping from database permission_name to i18n keys
 * This ensures consistency across the application
 */

export function getPermissionI18nKey(permissionName: string): string {
  const mapping: Record<string, string> = {
    // System Administration
    'system.superAdmin': 'superAdmin',
    'system.admin': 'systemAdmin',
    'system.logs': 'viewSystemLogs',
    'system.config': 'manageSystemConfig',
    'system.backup': 'manageSystemBackup',

    // User Management
    'user.view': 'viewUsers',
    'user.create': 'createUser',
    'user.edit': 'editUser',
    'user.delete': 'deleteUser',
    'user.view_list': 'viewUserList',
    'user.categorize_customers': 'categorizeCustomers',
    'user.manage_staff_roles': 'manageStaffRoles',

    // Role Management
    'role.view': 'viewRoles',
    'role.create': 'createRole',
    'role.edit': 'editRole',
    'role.delete': 'deleteRole',
    'role.assign': 'assignRole',

    // Permission Management
    'permission.view': 'viewPermissions',
    'permission.create': 'createPermission',
    'permission.edit': 'editPermission',
    'permission.delete': 'deletePermission',
    'permission.assign': 'assignPermission',

    // Audit & Reporting
    'audit.view': 'viewAudit',
    'audit.export': 'exportAudit',
    'report.view': 'viewReports',
    'report.create': 'createReport',
    'report.export': 'exportReport',

    // Order Management
    'order.view': 'viewOrders',
    'order.view_all': 'viewAllOrders',
    'order.create': 'createOrder',
    'order.edit': 'editOrder',
    'order.delete': 'deleteOrder',
    'order.update_status': 'updateOrderStatus',
    'order.cancel': 'cancelOrder',

    // Product Management
    'product.view': 'viewProducts',
    'product.create': 'createProduct',
    'product.edit': 'editProduct',
    'product.delete': 'deleteProduct',

    // Dashboard & General
    'dashboard.view': 'viewDashboard',
    'settings.edit': 'editSettings',

    // Financial Management
    'finance.approve_topup': 'approveTopup',
    'finance.process_withdrawal': 'processWithdrawal',
    'finance.view_all_transactions': 'viewAllTransactions',
    'finance.manage_debt': 'manageDebt',
    'finance.view_bank_usage_stats': 'viewBankStats',
    'finance.restore_transactions': 'restoreTransactions',
    'finance.process_withdrawal_requests': 'processWithdrawRequests',
    'finance.approve_topup_requests': 'approveTopupRequests',
    'finance.manual_topup': 'manualTopup',
    'finance.manage_bank_accounts': 'manageBankAccounts',
    'finance.view_transaction_history': 'viewTransactionHistory',
    'finance.manage_bank_permissions': 'manageBankPermissions',

    // Telesales
    'telesales.manager': 'telesalesManager',
    'telesales.member': 'telesalesMember',

    // Sales Management
    'sales.manage_orders': 'manageSalesOrders',
    'sales.view_assigned_orders': 'viewAssignedOrders',
    'sales.update_order_status': 'updateSalesOrderStatus',
    'sales.create_order_for_customers': 'createOrderForCustomers',
    'sales.manage_auctions': 'manageAuctions',
    'sales.create_auction': 'createAuction',
    'sales.update_auction': 'updateAuction',
    'sales.view_auction_results': 'viewAuctionResults',
    'sales.manage_bids': 'manageBids',
    'sales.view_own_salary': 'viewOwnSalary',
    'sales.view_own_commission': 'viewOwnCommission',
    'sales.view_own_performance': 'viewOwnPerformance',
    'sales.view_assigned_customers': 'viewAssignedCustomers',
    'sales.manage_assigned_customers': 'manageAssignedCustomers',
    'sales.update_customer_info': 'updateCustomerInfo',
    'sales.add_customer_notes': 'addCustomerNotes',
    'sales.view_customer_orders': 'viewCustomerOrders',
    'sales.access_dashboard': 'accessSalesDashboard',
    'sales.view_sales_reports': 'viewSalesReports',
    'sales.export_sales_data': 'exportSalesData',
  };

  return mapping[permissionName] || permissionName;
}

/**
 * Get localized permission label using i18n
 */
export function getPermissionLabel(
  permissionName: string,
  t: (key: string) => string,
  fallbackDescription?: string
): string {
  const i18nKey = getPermissionI18nKey(permissionName);
  const translatedLabel = t(`permissions.items.${i18nKey}`);

  // If translation is not found (key === result), use fallback
  if (translatedLabel === `permissions.items.${i18nKey}`) {
    return fallbackDescription || permissionName || t('common.unknown');
  }

  return translatedLabel;
}