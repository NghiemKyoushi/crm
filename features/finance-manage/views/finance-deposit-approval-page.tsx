"use client";
import React, { useState } from "react";
import FinanceTabs from "../components/tabs/deposit/finance-tabs";
import DepositTable from "../components/tabs/deposit/deposit-table";
import WithdrawTable from "../components/tabs/withdraw/withdraw-table";
import BankAccountSetting from "../components/tabs/bank-setting/deposit-bank-setting";

const FinanceDepositApprovalPage = () => {
  const [activeTab, setActiveTab] = useState("deposit");

  return (
    <div className="pt-4 pl-[212px]">
      <div className="p-4">
        <FinanceTabs activeKey={activeTab} onChange={setActiveTab} />

        {activeTab === "deposit" && <DepositTable />}

        {activeTab === "withdraw" && <WithdrawTable />}

        {activeTab === "bank-settings" && <BankAccountSetting />}

        {activeTab === "reconciliation" && (
          <h2 className="text-lg font-semibold">Công nợ & Đối soát</h2>
        )}
      </div>
    </div>
  );
};

export default FinanceDepositApprovalPage;
