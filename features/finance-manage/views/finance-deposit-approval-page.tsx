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

  return (
    <div className="pt-4 pl-[212px]">
        <FinanceTabs/>
    </div>
  );
};

export default FinanceDepositApprovalPage;
