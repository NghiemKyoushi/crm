"use client";
import { Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHeadset,
  faUsers,
  faLayerGroup,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import CustomerTable from "./customer-table";
import SalesPage from "../sale-manage/sales-page";
import StaffManagePage from "../staff-manage/staff-manage-page";
import CategoryCustomerPage from "../customer-group/customer-group-page";
import RoleManagerPage from "../role-manage/role-manage-pages";
import { useTranslation } from "react-i18next";
import { usePermission } from "@/components/layout/PermissionContext";
import { Spin } from "antd";
import { notFound } from "next/navigation";
import { useMemo } from "react";

export default function CustomerPage() {
  const { t } = useTranslation();
  const { hasPermission, loading, permissions } = usePermission();
  const canAccess = useMemo(() => {
    if (loading || permissions.length === 0) return undefined;

    return (
      hasPermission("user.categorize_customers") ||
      hasPermission("user.manage_staff_roles")
    );
  }, [loading, permissions, hasPermission]);

  if (loading) {
    return <Spin />;
  }
  if (!canAccess) {
    notFound();
  }
  const allTabs = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} />
          {t("tabs.customer")}
        </span>
      ),
      children: <CustomerTable />,
      perm: "user.categorize_customers",
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faHeadset} />
          {t("tabs.sales")}
        </span>
      ),
      children: <SalesPage />,
      perm: "user.categorize_customers",
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} />
          {t("tabs.staff")}
        </span>
      ),
      children: <StaffManagePage />,
      perm: "user.manage_staff_roles",
    },
    {
      key: "4",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faLayerGroup} />
          {t("tabs.categoryCustomer")}
        </span>
      ),
      children: <CategoryCustomerPage />,
      perm: "user.categorize_customers",
    },
    {
      key: "5",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUserShield} />
          {t("tabs.role")}
        </span>
      ),
      children: <RoleManagerPage />,
      perm: "user.manage_staff_roles",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spin tip="Đang tải quyền..." />
      </div>
    );
  }

  const allowedTabs = allTabs.filter((tab) => hasPermission(tab.perm));

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs
          defaultActiveKey={allowedTabs[0]?.key}
          destroyInactiveTabPane
          items={allowedTabs}
          className="user-management-tabs"
        />
      </div>
    </div>
  );
}
