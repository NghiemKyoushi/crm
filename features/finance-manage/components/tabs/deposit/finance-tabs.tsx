"use client";
import React, { useEffect, useState } from "react";
import { usePermission } from "@/components/layout/PermissionContext";
import { Spin } from "antd";
import FinanceTabs from "../withdraw/finance-tabs";
import DepositTable from "./deposit-table";
import WithdrawTable from "../withdraw/withdraw-table";
import BankAccountSetting from "@/features/finance-manage/components/tabs/bank-company/bank-company";
import {useSearchParams } from "next/navigation";
import BankPartnerSetting from "../bank-partner/bank-partner";

const FinanceDepositApprovalPage = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const code = searchParams.get("code");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { hasPermission, loading } = usePermission();
  // const router = useRouter();
  // const pathname = usePathname();
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
    hasPermission("finance.manage_debt") && "reconciliation",
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
  
  return (
    <div className="p-6">
      {
        activeTab !== null  ?
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <FinanceTabs
            activeKey={activeTab || ""}
            onChange={(key: string) => {
              setActiveTab(key);
            }}
            allowedTabs={allowedTabs}
          />
          <div className="px-6 pb-6 pt-1">
            {activeTab === "deposit" && (
              <DepositTable action={action ?? undefined} code={code ?? undefined} />
            )}
            {activeTab === "withdraw" && <WithdrawTable />}
            {activeTab === "bank-settings" && <BankAccountSetting />}
            {activeTab === "bank-partner" && <BankPartnerSetting/>}
            {/* {activeTab === "account-partner" && <BankAccountSetting />} */}
          </div>
        </div> : <Spin />
      }

      {/* {activeTab === "reconciliation" && (
          <h2 className="text-lg font-semibold">Công nợ & Đối soát</h2>
        )} */}
    </div>
  );
};

export default FinanceDepositApprovalPage;
