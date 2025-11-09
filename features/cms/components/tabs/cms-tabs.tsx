"use client";

import React from "react";
import { Tabs } from "antd";

type CMSTabsProps = {
    activeKey: string;
    onChange: (key: string) => void;
};

const CMSTabs: React.FC<CMSTabsProps> = ({ activeKey, onChange }) => {
    const items = [
        { key: "pages", label: "Pages" },
        { key: "categories", label: "Categories" },
        { key: "contents", label: "Contents" },
        { key: "banners", label: "Banners" },
        { key: "settings", label: "Settings" },
        { key: "aggregate", label: "Aggregate" },
    ];

    const validActive = items.find((i) => i.key === activeKey)?.key || items[0].key;

    return (
        <Tabs
            activeKey={validActive}
            onChange={onChange}
            items={items}
            type="line"
            className="cms-tabs"
        />
    );
};

export default CMSTabs;


