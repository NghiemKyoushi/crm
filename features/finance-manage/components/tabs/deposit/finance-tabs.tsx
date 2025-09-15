"use client";
import React, { useEffect, useState } from "react";
import { usePermission } from "@/components/layout/PermissionContext";
import { Spin } from "antd";
import FinanceTabs from "../withdraw/finance-tabs";
import DepositTable from "./deposit-table";
import WithdrawTable from "../withdraw/withdraw-table";
import BankAccountSetting from "../bank-setting/deposit-bank-setting";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FinanceDepositApprovalPage = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const code = searchParams.get("code");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { hasPermission, loading } = usePermission();
  const router = useRouter();
  const pathname = usePathname();
  const allowedTabs = [
    hasPermission("finance.approve_topup") && "deposit",
    hasPermission("finance.process_withdrawal") && "withdraw",
    "bank-settings",
    // hasPermission("FINANCE_MANAGE_BANK_ACCOUNTS") && "bank-settings",
    // hasPermission("finance.manage_debt") && "reconciliation",
  ].filter(Boolean) as string[];

  useEffect(() => {
    if (!loading) {
      // Chỉ set lần đầu khi chưa có activeTab
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
  }, [loading, action, allowedTabs, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spin tip="Đang tải quyền..." />
      </div>
    );
  }
  console.log("active tab", activeTab);

  return (
    <div className="pt-4">
      <FinanceTabs
        activeKey={activeTab || ""}
        onChange={(key: string) => {
          console.log("key", key);

          // router.replace(pathname);
          setActiveTab(key);
        }}
        allowedTabs={allowedTabs}
      />

      {activeTab === "deposit" && (
        <DepositTable action={action ?? undefined} code={code ?? undefined} />
      )}
      {activeTab === "withdraw" && <WithdrawTable />}
      {activeTab === "bank-settings" && <BankAccountSetting />}
      {/* {activeTab === "reconciliation" && (
          <h2 className="text-lg font-semibold">Công nợ & Đối soát</h2>
        )} */}
    </div>
  );
};

export default FinanceDepositApprovalPage;
