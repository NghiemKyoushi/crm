"use client";

import React from "react";
import { Layout, Avatar, Button, Dropdown } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import LanguageSwitcher from "../LanguageSwitcher";
import { storage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import {
    faUser,
  } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
    const router = useRouter();
    
    const handleLogout = () => {
        storage.clear();
        router.push('/login');
      };
    
      const menuItems = [
        {
          key: "logout",
          label: (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ padding: 0 }}
            >
              Logout
            </Button>
          ),
        },
      ];
  return (
    <AntHeader
    className="!fixed !top-0 !left-[256px] !right-0 !h-16 !bg-white px-6 flex justify-end items-center content-center z-40 gap-4"
  >
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click", "hover"]}
      placement="bottomRight"
    >
      <Avatar
        icon={<FontAwesomeIcon className="text-blue-400" icon={faUser} />}
        className="cursor-pointer"
        style={{ backgroundColor: "rgb(219 234 254)" }}
      />
    </Dropdown>
    <div className="flex items-center justify-center align-middle content-center">
    <LanguageSwitcher />
  </div>
  </AntHeader>
  );
};
