"use client";
import React, { useMemo } from "react";
import FinanceTabs from "../components/tabs/deposit/finance-tabs";
import { notFound } from "next/navigation";
import { Spin } from "antd";
import { usePermission } from "@/components/layout/PermissionContext";

const FinanceDepositApprovalPage = () => {
  const { hasPermission, loading, permissions } = usePermission();
  const canAccess = useMemo(() => {
    if (loading || permissions.length === 0) return undefined;

    return (
      hasPermission("finance.approve_topup") ||
      hasPermission("finance.manage_debt") ||
      hasPermission("finance.process_withdrawal") 
    );
  }, [loading, permissions, hasPermission]);

  if (loading) {
    return <Spin />;
  }
  if (!canAccess) {
    notFound();
  }
  return (
    <div className="pt-4 pl-[212px]">
      <FinanceTabs />
    </div>
  );
};

export default FinanceDepositApprovalPage;
