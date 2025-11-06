"use client";

import React from "react";
import { Menu } from "antd";

type CMSHeaderProps = {
    activeKey: string;
    onChange: (key: string) => void;
};

export default function CMSHeader({ activeKey, onChange }: CMSHeaderProps) {
    return (
        <Menu
            mode="horizontal"
            selectedKeys={[activeKey]}
            onClick={(e) => onChange(e.key)}
            items={[
                { key: "pages", label: "pages" },
                { key: "categories", label: "categories" },
                { key: "contents", label: "contents" },
                { key: "banners", label: "banners" },
                { key: "settings", label: "settings" },
                { key: "aggregate", label: "aggregate" },
            ]}
        />
    );
}


