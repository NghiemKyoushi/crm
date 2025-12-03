"use client";

import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import Link from "next/link";
import Image from "next/image";
import logoCRM from "@/assets/login/logo_crm.jpg";
import { usePathname } from "next/navigation";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  TeamOutlined,
  TagsOutlined,
  SettingOutlined,
  YuqueOutlined,
  HomeOutlined,
  MenuOutlined,
  LeftOutlined,
  CheckSquareOutlined,
  CustomerServiceOutlined,
  CrownOutlined,
  DollarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { usePermission } from "./PermissionContext";
import { useSidebar } from "@/contexts/SidebarContext";

const { Sider } = Layout;

export const menuPermissions: Record<string, string[]> = {
  // Dashboard - accessible to most users
  "/dashboard": ["dashboard.view"],

  // Order Management - view permissions for most, edit for operations
  "/orderhub": [
    "order.view",
    "order.view_all",
    "order.update_status",
    "order.create",
    "sales.view_assigned_orders",
    "sales.create_order_for_customers",
  ],

  // Finance Management - restricted to finance roles
  "/finance-management": [
    "finance.approve_topup",
    "finance.process_withdrawal",
    "finance.view_all_transactions",
    "finance.manage_debt",
    "finance.approve_topup_requests",
    "finance.process_withdrawal_requests",
    "finance.manual_topup",
    "finance.manage_bank_accounts",
    "finance.view_transaction_history",
    "finance.manage_bank_permissions",
  ],

  // User Management - HR and admin functions
  "/user-management": [
    "user.view_list",
    "user.categorize_customers",
    "user.manage_staff_roles",
    "user.view",
    "role.view",
    "permission.view",
    "sales.manage_assigned_customers",
  ],

  // Telesales - manager or member access
  "/telesales-manage": ["telesales.manager", "telesales.member"],

  // Sales Management - sales team access
  "/sales-management": [
    "sales.manage_orders",
    "sales.view_assigned_orders",
    "sales.view_own_salary",
    "sales.view_own_commission",
    "sales.access_dashboard",
    "sales.view_sales_reports",
    "sales.manage_assigned_customers",
  ],

  // Sales Salary Management - admin and finance
  "/sales-salary-management": [
    "sales.view_own_salary",
    "sales.view_own_commission",
    "sales.manage_salaries",
    "finance.view_all_transactions",
    "system.admin",
  ],

  // Partner Management - finance and admin
  "/partner-manage": [
    // "finance.manage_bank_accounts",
    // "finance.manage_bank_permissions",
    "material.partner_manage",
    "system.admin",
  ],

  // System Settings - admin only
  "/settings": ["system.admin", "settings.edit"],

  // Website Management - admin and system config
  "/website-manage": ["system.admin", "system.config"],

  // Fee Setting - admin or settings.edit
  "/fee-setting": ["system.admin", "settings.edit"],

  // Surcharge - order and pricing
  "/surchange": ["order.view", "order.create", "order.edit", "system.admin"],
  //
  "/shipment-management": [
    "system.admin",
    "sales.view_assigned_shipments",
    "warehouse.check_coming_wh2",
    "warehouse.management_wh2",
    "warehouse.packed_view_wh2",
    "warehouse.pick_and_pack_wh2",
    "warehouse.shipment_wh2",
    "warehouse.shipped_view_wh2",
    "warehouse.view_wh2",
  ],

  // Check Coming - Warehouse
  "/check-coming": ["warehouse.check_coming_wh1", "system.admin"],

  // CRM - open access initially
  "/cms": ["cms.view_screen", "cms.edit_screen"],
  "/aution-manage": ["system.admin"],
  // VIP Management - admin and system config
  "/vip-management": ["system.admin", "vip.manage"],
};

export const menuItems = [
  { key: "/dashboard", icon: DashboardOutlined, label: "dashboard" },
  { key: "/orderhub", icon: ShoppingCartOutlined, label: "orders" },
  { key: "/shipment-management", icon: HomeOutlined, label: "operation" },
  { key: "/check-coming", icon: CheckSquareOutlined, label: "checkComing" },
  { key: "/partner-manage", icon: YuqueOutlined, label: "partnerManagement" },
  // { key: "/sales-management", icon: DollarOutlined, label: "saleRecord" },
  { key: "/finance-management", icon: WalletOutlined, label: "finance" },
  { key: "/user-management", icon: TeamOutlined, label: "userManagement" },
  {
    key: "/telesales-manage",
    icon: CustomerServiceOutlined,
    label: "telesaleManagement",
  },
  {
    key: "/sales-salary-management",
    icon: DollarOutlined,
    label: "salesSalaryManagement",
  },

  // { key: "/fee-setting", icon: TagsOutlined, label: "products" },
  // { key: "/surchange", icon: TagsOutlined, label: "surcharge" },
  { key: "/cms", icon: TagsOutlined, label: "cms" },
  { key: "/website-manage", icon: GlobalOutlined, label: "websiteManagement" },
  { key: "/vip-management", icon: CrownOutlined, label: "vipManagement" },
  { key: "/aution-manage", icon: SettingOutlined, label: "aution" },
  { key: "/settings", icon: SettingOutlined, label: "settings" },
];
export const Sidebar: React.FC = () => {
  const { collapsed, toggle } = useSidebar();

  const pathname = usePathname();
  const { t } = useTranslation();

  const { hasPermission } = usePermission();

  // chỉ render menu khi có quyền
  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      const required = menuPermissions[item.key] || [];
      if (required.length === 0) return true;
      return required.some((perm) => hasPermission(perm));
    });
  }, [hasPermission]);

  return (
    // <Sider
    //   width={256}
    //   //   collapsedWidth={256}
    //   className="!fixed !top-0 !left-0 !h-screen shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] z-50"
    //   theme="light"
    //   //   breakpoint="lg"
    //   collapsible={false}
    // >
    //   <div className="text-gray-800 font-bold p-4 shadow-md flex justify-starts items-center gap-4">
    //     <div className=" z-50">
    //       <Image
    //         src={logoCRM}
    //         alt="CRM Logo"
    //         width={45}
    //         height={45}
    //         className="rounded-full shadow-sm"
    //       />
    //     </div>
    //     <span>OrderSystem</span>
    //   </div>
    //   <Menu
    //     style={{ border: "none" }}
    //     theme="light"
    //     mode="inline"
    //     items={filteredMenu.map((item) => ({
    //       key: item.key,
    //       icon: <FontAwesomeIcon className="w-4 h-4" icon={item.icon} />,
    //       label: <Link href={item.key}>{t(`menu.${item.label}`)}</Link>,
    //     }))}
    //     selectedKeys={[pathname]}
    //   />
    // </Sider>
    <Sider
      width={256}
      collapsedWidth={64}
      collapsed={collapsed}
      trigger={null}
      className="!fixed !top-0 !left-0 !h-screen !bg-white border-r border-gray-200 z-50 transition-all duration-300"
      theme="light"
    >
      {/* Logo + toggle */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-200 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Image
              src={logoCRM}
              alt="CRM Logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="font-semibold text-gray-800 text-sm">
              OrderSystem
            </span>
          </div>
        )}
        <button
          onClick={toggle}
          className="w-8 h-8 min-w-8 min-h-8 shrink-0 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <MenuOutlined style={{ fontSize: 14 }} />
          ) : (
            <LeftOutlined style={{ fontSize: 14 }} />
          )}
        </button>
      </div>

      {/* Menu */}
      <div className="py-2">
        <Menu
          style={{ border: "none" }}
          theme="light"
          mode="inline"
          items={filteredMenu.map((item) => ({
            key: item.key,
            icon: <item.icon style={{ fontSize: 16 }} />,
            label: (
              <Link passHref shallow href={item.key}>
                {t(`menu.${item.label}`)}
              </Link>
            ),
          }))}
          selectedKeys={[pathname]}
        />
      </div>
    </Sider>
  );
};
