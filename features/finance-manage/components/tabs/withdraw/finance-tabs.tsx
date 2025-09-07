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
          <FontAwesomeIcon icon={faArrowDown} />
          {t("deposit.depositTitle")}
        </span>
      ),
    },
    {
      key: "withdraw",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowUp} />
          {t("deposit.withdraw")} 
        </span>
      ),
    },
    {
      key: "bank-settings",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUniversity} />
          {t("deposit.bankSettings")}
        </span>
      ),
    },
    {
      key: "reconciliation",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBalanceScale} />
          {t("deposit.reconciliation")}
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
