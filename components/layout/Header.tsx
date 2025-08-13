"use client";

import React from "react";
import { Layout, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  return (
    <AntHeader
    className="!fixed !top-0 !left-[256px] !right-0 !h-16 !bg-white px-6 flex justify-end items-center z-40" 
    >
      <Avatar icon={<UserOutlined />} />
    </AntHeader>
  );
};
