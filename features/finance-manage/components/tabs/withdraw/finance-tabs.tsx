"use client";
import React from "react";
import { Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faUniversity,
  faBalanceScale,
} from "@fortawesome/free-solid-svg-icons";

interface FinanceTabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  allowedTabs: string[];
}

const FinanceTabs: React.FC<FinanceTabsProps> = ({
  activeKey,
  onChange,
  allowedTabs,
}) => {
  const allItems = [
    {
      key: "deposit",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowDown} />
          Lệnh nạp tiền
        </span>
      ),
    },
    {
      key: "withdraw",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowUp} />
          Yêu cầu rút tiền
        </span>
      ),
    },
    {
      key: "bank-settings",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUniversity} />
          Cài đặt Ngân hàng
        </span>
      ),
    },
    {
      key: "reconciliation",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBalanceScale} />
          Công nợ & Đối soát
        </span>
      ),
    },
  ];

  const items = allItems.filter((item) => allowedTabs.includes(item.key));

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
      items={items}
      type="line"
    />
  );
};

export default FinanceTabs;
