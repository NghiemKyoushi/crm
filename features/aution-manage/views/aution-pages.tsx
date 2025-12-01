"use client";

import React from "react";
import { Tabs } from "antd";
import { TabLink } from "../components/tab-link";
import { TabCustomer } from "../components/tab-customer";
import { TabResult } from "../components/tab-result";


export const AuctionPage = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <Tabs
        defaultActiveKey="1"
        items={[
          { key: "1", label: "Theo link", children: <TabLink /> },
          { key: "2", label: "Theo khách", children: <TabCustomer /> },
          { key: "3", label: "Thắng thua", children: <TabResult /> },
        ]}
      />
    </div>
  );
};

export default AuctionPage;
