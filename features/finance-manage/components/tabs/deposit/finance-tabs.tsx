"use client";
import React, { useState } from "react";
import { usePermission } from "@/components/layout/PermissionContext";
import { Spin } from "antd";
import FinanceTabs from "../withdraw/finance-tabs";
import DepositTable from "./deposit-table";
import WithdrawTable from "../withdraw/withdraw-table";
import BankAccountSetting from "../bank-setting/deposit-bank-setting";
import { useSearchParams } from "next/navigation";

const FinanceDepositApprovalPage = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const code = searchParams.get("code");
  const [activeTab, setActiveTab] = useState("deposit");
  const { hasPermission, loading } = usePermission();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spin tip="Đang tải quyền..." />
      </div>
    );
  }

  const allowedTabs = [
    hasPermission("finance.approve_topup") && "deposit",
    hasPermission("finance.approve_topup") && "withdraw",
    hasPermission("FINANCE_MANAGE_BANK_ACCOUNTS") && "bank-settings",
    // hasPermission("finance.manage_debt") && "reconciliation",
  ].filter(Boolean) as string[];

  return (
    <div className="pt-4">
      <FinanceTabs
        activeKey={activeTab}
        onChange={setActiveTab}
        allowedTabs={allowedTabs}
      />

      {activeTab === "deposit" && <DepositTable action={action ?? undefined} code={code ?? undefined} />}
      {activeTab === "withdraw" && <WithdrawTable />}
      {activeTab === "bank-settings" && <BankAccountSetting />}
      {/* {activeTab === "reconciliation" && (
          <h2 className="text-lg font-semibold">Công nợ & Đối soát</h2>
        )} */}
    </div>
  );
};

export default FinanceDepositApprovalPage;
