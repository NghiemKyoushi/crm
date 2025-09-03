"use client";

import React from "react";
import CustomerPage from "../components/customer-manage/customer-page";
import { PermissionProvider } from "@/components/layout/PermissionContext";

export default function UserManagementPage() {
  return (
    <div className="pt-4 pl-[212px] ">
      <PermissionProvider>
        <CustomerPage />
      </PermissionProvider>
    </div>
  );
}
