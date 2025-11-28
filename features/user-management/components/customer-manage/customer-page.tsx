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
      hasPermission("user.manage_staff_roles") ||
      hasPermission("sales.manage_assigned_customers")
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
      perm: "user.view",
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
      perm: "sales.view_customer_orders",
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
      perm: "user.view",
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
      perm: "role.view",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spin tip="Đang tải quyền..." />
      </div>
    );
  }

  const hasSalesOnly =
    hasPermission("sales.manage_assigned_customers") &&
    permissions.filter((p) =>
      [
        "user.view",
        "role.view",
        "user.categorize_customers",
        "user.manage_staff_roles",
      ].includes(p.name)
    ).length === 0;

  const allowedTabs = hasSalesOnly
    ? allTabs.filter((tab) => tab.key === "1")
    : allTabs.filter((tab) => hasPermission(tab.perm));
  return (
    <div>
      <Tabs
        defaultActiveKey={allowedTabs[0]?.key}
        destroyInactiveTabPane
        items={allowedTabs}
        className="user-management-tabs"
      />
    </div>
  );
}
