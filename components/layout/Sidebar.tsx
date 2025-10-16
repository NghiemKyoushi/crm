"use client";

import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import Link from "next/link";
import Image from "next/image";
import logoCRM from "@/assets/login/logo_crm.jpg";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faShoppingCart,
  faWallet,
  faUsers,
  faGavel,
  faTags,
  faCog,
  faMoneyBill,
  faHeadset,
  faYenSign,
  faWarehouse,
  faBars,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { usePermission } from "./PermissionContext";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

const { Sider } = Layout;

export const menuPermissions: Record<string, string[]> = {
  // Dashboard - accessible to most users
  "/dashboard": ["dashboard.view"],

  // Order Management - view permissions for most, edit for operations
  "/orderhub": ["order.view", "order.view_all", "order.update_status", "order.create", "sales.view_assigned_orders", "sales.create_order_for_customers"],

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
    "finance.manage_bank_permissions"
  ],

  // User Management - HR and admin functions
  "/user-management": [
    "user.view_list",
    "user.categorize_customers",
    "user.manage_staff_roles",
    "user.view",
    "role.view",
    "permission.view",
    "sales.manage_assigned_customers"
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
    "sales.manage_assigned_customers"
  ],

  // Partner Management - finance and admin
  "/partner-manage": [
    "finance.manage_bank_accounts",
    "finance.manage_bank_permissions",
    "system.admin"
  ],

  // System Settings - admin only
  "/settings": ["system.admin", "settings.edit"],

  // Website Management - admin and system config
  "/website-manage": ["system.admin", "system.config"],

  // Fee Setting - product management permissions
  "/fee-setting": ["product.view", "product.create", "product.edit", "system.admin"],

  // Surcharge - product and pricing
  "/surchange": ["product.view", "product.create", "product.edit", "system.admin"],
  //
  "/shipment-management":["system.admin", "sales.view_assigned_shipments", "sales.create_shipments" ]
};

export const menuItems = [
  { key: "/dashboard", icon: faTachometerAlt, label: "dashboard" },
  { key: "/orderhub", icon: faShoppingCart, label: "orders" },
  { key: "/shipment-management", icon: faWarehouse, label: "operation" },
  { key: "/partner-manage", icon: faYenSign, label: "partnerManagement" },
  // { key: "/sales-management", icon: faMoneyBill, label: "saleRecord" },
  { key: "/finance-management", icon: faWallet, label: "finance" },
  { key: "/user-management", icon: faUsers, label: "userManagement" },
  // { key: "/telesales-manage", icon: faHeadset, label: "telesaleManagement" },
  // { key: "/fee-setting", icon: faTags, label: "products" },
  // { key: "/surchange", icon: faTags, label: "surcharge" },
  // { key: "/website-manage", icon: faGavel, label: "action" },

  { key: "/settings", icon: faCog, label: "settings" },
];
export const Sidebar: React.FC = () => {
  const { collapsed ,toggle } = useSidebar();

  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();

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
      className="!fixed !top-0 !left-0 !h-screen shadow-md z-50"
      theme="light"
    >
      {/* Logo + toggle */}
      <div className={`flex items-center  p-4 shadow-md ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Image
              src={logoCRM}
              alt="CRM Logo"
              width={40}
              height={40}
              className="rounded-full shadow-sm"
            />
            <span className="font-bold text-gray-800">OrderSystem</span>
          </div>
        )}
        <button onClick={toggle} className="text-gray-600 hover:text-black">
          <FontAwesomeIcon icon={collapsed ? faBars : faChevronLeft} />
        </button>
      </div>

      <Menu
        style={{ border: "none" }}
        theme="light"
        mode="inline"
        items={filteredMenu.map((item) => ({
          key: item.key,
          icon: <FontAwesomeIcon className="w-4 h-4" icon={item.icon} />,
          label: <Link passHref shallow href={item.key}>{t(`menu.${item.label}`)}</Link>,
        }))}
        selectedKeys={[pathname]}
      />
    </Sider>
  );
};
