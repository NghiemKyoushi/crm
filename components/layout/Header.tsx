"use client";

import React, { useMemo } from "react";
import { Layout, Avatar, Button, Dropdown } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import LanguageSwitcher from "../LanguageSwitcher";
import { storage } from "@/lib/storage";
import { usePathname, useRouter } from "next/navigation";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { logout } from "@/services/auth";
import { menuItems, menuPermissions } from "./Sidebar";
import { useTranslation } from "react-i18next";
import { usePermission } from "./PermissionContext";
import Cookies from "js-cookie";

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { hasPermission, loading } = usePermission();

  // xác định menu hiện tại
  const currentMenu = useMemo(() => {
    const item = menuItems.find((i) => i.key === pathname);
    if (!item) return null;

    const required = menuPermissions[item.key] || [];
    if (required.length === 0) return item; // route ko yêu cầu quyền

    // check quyền
    const allowed = required.some((perm) => hasPermission(perm));
    return allowed ? item : null;
  }, [pathname, hasPermission]);

  const handleLogout = async () => {
    await logout();
    storage.clear();
    Cookies.remove("token", { path: "" }); 
    router.push("/login");
  };

  const menuItem = [
    {
      key: "userprofile",
      label: (
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faUser} />}
          onClick={() => router.push("/user-profile")}
          style={{ width: "100%" }}
        >
          User profile
        </Button>
      ),
    },
    {
      key: "logout",
      label: (
        <Button
          type="dashed"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ width: "100%" }}
        >
          Logout
        </Button>
      ),
    },
  ];

  return (
    <AntHeader
      className="!fixed !top-0 !left-[256px] !right-0 !h-16 
             !bg-white !p-6 flex justify-between items-center 
             z-40 gap-4 border-b border-gray-200 shadow-sm"
    >
      <div className="text-lg font-semibold text-left">
        {loading
          ? "Đang tải..."
          : currentMenu
          ? t(`menu.${currentMenu.label}`)
          : "OrderSystem"}
      </div>
      <div className="flex items-center justify-center align-middle content-center">
        <Dropdown
          menu={{ items: menuItem }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Avatar
            icon={<FontAwesomeIcon className="text-gray-500" icon={faUser} />}
            className="cursor-pointer"
            style={{ backgroundColor: "rgb(219 234 254)" }}
            />
        </Dropdown>
        <LanguageSwitcher />
      </div>
    </AntHeader>
  );
};
