"use client";
import React, { useEffect, useState, useRef } from "react";
import { usePermission } from "@/components/layout/PermissionContext";
import { Spin } from "antd";
import FinanceTabs from "../withdraw/finance-tabs";
import DepositTable from "./deposit-table";
import WithdrawTable from "../withdraw/withdraw-table";
import BankAccountSetting from "@/features/finance-manage/components/tabs/bank-company/bank-company";
import { useSearchParams } from "next/navigation";
import BankPartnerSetting from "../bank-partner/bank-partner";
import PartnerDebtTable from "../debt_manage/debt_manage";
import { useQueryClient } from "@tanstack/react-query";

// const TAB_COMPONENTS: Record<string, React.FC<any>> = {
//   "deposit": DepositTable,
//   "withdraw": WithdrawTable,
//   "bank-settings": BankAccountSetting,
//   "bank-partner": BankPartnerSetting,
//   "manage_debt": PartnerDebtTable,
// };

const FinanceDepositApprovalPage = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const code = searchParams.get("code");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tabKey, setTabKey] = useState<number>(0); // force key để remount
  const { hasPermission, loading } = usePermission();
  const queryClient = useQueryClient();

  const allowedTabs = [ 
    (
      hasPermission("finance.view_all_transactions") ||
      hasPermission("finance.view_topup_transactions")
    ) && "deposit",
    (
      hasPermission("finance.view_all_transactions") ||
      hasPermission("finance.view_withdrawal_transactions")
    ) && "withdraw",
    hasPermission("finance.manage_bank_accounts") && "bank-settings",
    hasPermission("finance.manage_bank_partner") && "bank-partner",
    hasPermission("finance.manage_bank_accounts") && "account-partner",
    hasPermission("finance.manage_debt") && "manage_debt",
  ].filter(Boolean) as string[];

  useEffect(() => {
    if (!loading) {
      if (!activeTab) {
        let nextTab = "deposit";
        if (action && allowedTabs.includes(action)) {
          nextTab = action;
        } else if (allowedTabs.length > 0) {
          nextTab = allowedTabs[0];
        }
        setActiveTab(nextTab);
      }
    }
    // eslint-disable-next-line
  }, [loading, action, allowedTabs]);

  const handleTabChange = (key: string) => {
    queryClient.removeQueries({ queryKey: ["listTopup"] });
    queryClient.removeQueries({ queryKey: ["listwithdraw"] });
    queryClient.removeQueries({ queryKey: ["bankAccounts"] });
    queryClient.removeQueries({ queryKey: ["bankAccountsPartner"] });
    queryClient.removeQueries({ queryKey: ["debtList"] });
    setActiveTab(key);
    setTabKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spin tip="Đang tải quyền..." />
      </div>
    );
  }

  const renderTabContent = () => {
    if (!activeTab) return null;
    switch (activeTab) {
      case "deposit":
        return <DepositTable key={`tab_${tabKey}_deposit`} action={action ?? undefined} code={code ?? undefined} />;
      case "withdraw":
        return <WithdrawTable key={`tab_${tabKey}_withdraw`} />;
      case "bank-settings":
        return <BankAccountSetting key={`tab_${tabKey}_banksettings`} />;
      case "bank-partner":
        return <BankPartnerSetting key={`tab_${tabKey}_bankpartner`} />;
      case "manage_debt":
        return <PartnerDebtTable key={`tab_${tabKey}_managedebt`} />;
      // Thêm các case khác nếu có
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {activeTab !== null ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <FinanceTabs
            activeKey={activeTab || ""}
            onChange={handleTabChange}
            allowedTabs={allowedTabs}
          />
          <div className="px-6 pb-6 pt-1">
            {renderTabContent()}
          </div>
        </div>
      ) : (
        <Spin />
      )}
    </div>
  );
};

export default FinanceDepositApprovalPage;
