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
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { usePermission } from "./PermissionContext";

const { Sider } = Layout;

export const menuPermissions: Record<string, string[]> = {
  "/dashboard": [], 
  "/orderhub": ["order.view_all", "order.update_status"],
  "/finance-management": [
    "finance.approve_topup",
    "finance.manage_debt",
    "finance.process_withdrawal",
    "finance.view_all_transactions",
  ],
  "/user-management": ["user.view_list", "user.categorize_customers"],
  "/telesales-manage":[],
  "/auction": [], 
  "/products": [], 
  "/settings": ["system.admin", "system.superAdmin"],
  "/sales-management": [],
  "website-manage":[],
};

export const menuItems = [
  { key: "/dashboard", icon: faTachometerAlt, label: "dashboard" },
  { key: "/orderhub", icon: faShoppingCart, label: "orders" },
  { key: "/finance-management", icon: faWallet, label: "finance" },
  { key: "/sales-management", icon: faMoneyBill, label: "saleRecord" },
  { key: "/user-management", icon: faUsers, label: "userManagement" },
  { key: "/telesales-manage", icon: faHeadset, label: "telesaleManagement" },
  { key: "/auction", icon: faGavel, label: "action" },
  { key: "/surchange", icon: faTags, label: "products" },
  { key: "/settings", icon: faCog, label: "settings" },

];
export const Sidebar: React.FC = () => {
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
    <Sider
      width={256}
      //   collapsedWidth={256}
      className="!fixed !top-0 !left-0 !h-screen shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] z-50"
      theme="light"
      //   breakpoint="lg"
      collapsible={false}
    >
      <div className="text-gray-800 font-bold p-4 shadow-md flex justify-starts items-center gap-4">
        <div className=" z-50">
          <Image
            src={logoCRM}
            alt="CRM Logo"
            width={45}
            height={45}
            className="rounded-full shadow-sm"
          />
        </div>
        <span>OrderSystem</span>
      </div>
      <Menu
        style={{ border: "none" }}
        theme="light"
        mode="inline"
        items={filteredMenu.map((item) => ({
          key: item.key,
          icon: <FontAwesomeIcon className="w-4 h-4" icon={item.icon} />,
          label: <Link href={item.key}>{t(`menu.${item.label}`)}</Link>,
        }))}
        selectedKeys={[pathname]}
      />
    </Sider>
  );
};
