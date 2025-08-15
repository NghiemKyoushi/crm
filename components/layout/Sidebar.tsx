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

const { Sider } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
  },
  {
    key: "orders",
    icon: <ShoppingCartOutlined />,
    label: "Quản lý Đơn hàng",
  },
  {
    key: "finance",
    icon: <DollarOutlined />,
    label: "Quản lý Tài chính",
  },
  {
    key: "users",
    icon: <UserOutlined />,
    label: <Link href="/user-management">Quản lý Người dùng</Link>,
  },
  {
    key: "auction",
    icon: <ToolOutlined />,
    label: "Hệ thống Đấu giá",
  },
  {
    key: "products",
    icon: <TagsOutlined />,
    label: "Loại sản phẩm & Phí",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Cài đặt Hệ thống",
  },
];

export const Sidebar: React.FC = () => {
  return (
    <Sider
      width={256}
      collapsedWidth={256}
      className="!fixed !top-0 !left-0 !h-screen shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] z-50"
      theme="light"
      breakpoint="lg"
    >
      <div className="text-gray-800 font-bold p-4 shadow-md">OrderSystem</div>
      <Menu
        style={{ border: "none" }}
        theme="light"
        mode="inline"
        items={menuItems}
      />
    </Sider>
  );
};
