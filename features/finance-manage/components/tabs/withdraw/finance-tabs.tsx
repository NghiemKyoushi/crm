"use client";
import React from "react";
import { Tabs } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, AuditOutlined, BankOutlined, TeamOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const allItems = [
    {
      key: "deposit",
      label: (
        <span className="flex items-center gap-2">
          <ArrowDownOutlined />
          {t("deposit.depositTitle")}
        </span>
      ),
    },
    {
      key: "withdraw",
      label: (
        <span className="flex items-center gap-2">
          <ArrowUpOutlined />
          {t("deposit.withdraw")} 
        </span>
      ),
    },
    {
      key: "bank-settings",
      label: (
        <span className="flex items-center gap-2">
          <BankOutlined />
          {t("deposit.bankSettings")}
        </span>
      ),
    },
    {
      key: "bank-partner",
      label: (
        <span className="flex items-center gap-2">
          <TeamOutlined />
          {t("deposit.bankPartner")}
        </span>
      ),
    },
    {
      key: "manage_debt",
      label: (
        <span className="flex items-center gap-2">
          <AuditOutlined />
          {t("deposit.reconciliation")}
        </span>
      ),
    },
  ];

  const items = allItems.filter((item) => allowedTabs.includes(item.key));
  const validActiveKey =
  items.find((item) => item.key === activeKey)?.key || items[0]?.key;
  return (
    <Tabs
      activeKey={validActiveKey}
      onChange={onChange}
      items={items}
      type="line"
      className="finance-management-tabs"
    />
  );
};

export default FinanceTabs;
