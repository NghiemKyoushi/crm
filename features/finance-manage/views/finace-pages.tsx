"use client";

import React from "react";
import { PermissionProvider } from "@/components/layout/PermissionContext";
import FinanceDepositApprovalPage from "./finance-deposit-approval-page";

export default function FinnaceManagementPage() {
  return (
      <PermissionProvider>
        <FinanceDepositApprovalPage />
      </PermissionProvider>
  );
}
