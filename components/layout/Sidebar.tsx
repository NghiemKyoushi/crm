"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  ToolOutlined,
  TagsOutlined,
  SettingOutlined,
} from "@ant-design/icons";
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
} from "@fortawesome/free-solid-svg-icons";

const { Sider } = Layout;
const menuItems = [
  {
    key: "/dashboard",
    icon: <FontAwesomeIcon icon={faTachometerAlt} />,
    label: <Link href="/dashboard">Dashboard</Link>,
  },
  {
    key: "/orders",
    icon: <FontAwesomeIcon icon={faShoppingCart} />,
    label: "Quản lý Đơn hàng",
  },
  {
    key: "/finance",
    icon: <FontAwesomeIcon icon={faWallet} />,
    label: "Quản lý Tài chính",
  },
  {
    key: "/user-management",
    icon: <FontAwesomeIcon icon={faUsers} />,
    label: <Link href="/user-management">Quản lý Người dùng</Link>,
  },
  {
    key: "/auction",
    icon: <FontAwesomeIcon icon={faGavel} />,
    label: "Hệ thống Đấu giá",
  },
  {
    key: "/products",
    icon: <FontAwesomeIcon icon={faTags} />,
    label: "Loại sản phẩm & Phí",
  },
  {
    key: "/settings",
    icon: <FontAwesomeIcon icon={faCog} />,
    label: "Cài đặt Hệ thống",
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  return (
    <Sider
      width={256}
      collapsedWidth={256}
      className="!fixed !top-0 !left-0 !h-screen shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] z-50"
      theme="light"
      breakpoint="lg"
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
        items={menuItems}
        selectedKeys={[pathname]}
      />
    </Sider>
  );
};
