"use client";
import React, { useState } from "react";
import FinanceTabs from "../components/tabs/deposit/finance-tabs";
import DepositTable from "../components/tabs/deposit/deposit-table";
import WithdrawTable from "../components/tabs/withdraw/withdraw-table";
import BankAccountSetting from "../components/tabs/bank-setting/deposit-bank-setting";
import { usePermission } from "@/components/layout/PermissionContext";
import NoPermission from "@/components/layout/NoPermission";
import { Spin } from "antd";

const FinanceDepositApprovalPage = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const { hasPermission, loading } = usePermission();

  const renderWithPermission = (
    perm: string,
    component: React.ReactNode
  ) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-10">
          <Spin tip="Đang tải quyền..." />
        </div>
      );
    }
    return hasPermission(perm) ? component : <NoPermission />;
  };

  return (
    <div className="pt-4 pl-[212px]">
      <div className="p-4">
        <FinanceTabs activeKey={activeTab} onChange={setActiveTab} />

        {activeTab === "deposit" &&
          renderWithPermission("finance.approve_topup", <DepositTable />)}

        {activeTab === "withdraw" &&
          renderWithPermission("finance.approve_topup", <WithdrawTable />)}

        {activeTab === "bank-settings" &&
          renderWithPermission("FINANCE_MANAGE_BANK_ACCOUNTS", <BankAccountSetting />)}

        {activeTab === "reconciliation" &&
          renderWithPermission(
            "finance.manage_debt",
            <h2 className="text-lg font-semibold">Công nợ & Đối soát</h2>
          )}
      </div>
    </div>
  );
};

export default FinanceDepositApprovalPage;
