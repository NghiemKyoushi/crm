"use client";

import React from "react";
import { Card, Table, Skeleton, Empty, Tag, Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faShoppingCart,
  faMoneyBillWave,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  TopCustomer,
  TopDebtCustomer,
} from "@/types/analytics";

interface TopCustomersTableProps {
  topSpendingData?: TopCustomer[];
  topOrdersData?: TopCustomer[];
  topDebtData?: TopDebtCustomer[];
  isLoadingSpending: boolean;
  isLoadingOrders: boolean;
  isLoadingDebt: boolean;
}

const TopCustomersTable: React.FC<TopCustomersTableProps> = ({
  topSpendingData,
  topOrdersData,
  topDebtData,
  isLoadingSpending,
  isLoadingOrders,
  isLoadingDebt,
}) => {
  const { t } = useTranslation();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRankBadge = (index: number) => {
    if (index === 0)
      return (
        <span className="text-lg" role="img" aria-label="first">
          🥇
        </span>
      );
    if (index === 1)
      return (
        <span className="text-lg" role="img" aria-label="second">
          🥈
        </span>
      );
    if (index === 2)
      return (
        <span className="text-lg" role="img" aria-label="third">
          🥉
        </span>
      );
    return (
      <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
        {index + 1}
      </span>
    );
  };

  const spendingColumns = [
    {
      title: "#",
      key: "rank",
      width: 50,
      render: (_: any, __: any, index: number) => getRankBadge(index),
    },
    {
      title: t("dashboard.customer", "Khách hàng"),
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name: string, record: TopCustomer) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: t("dashboard.total_spent", "Tổng chi tiêu"),
      dataIndex: "total_spent",
      key: "total_spent",
      render: (value: number) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: t("dashboard.orders", "Đơn hàng"),
      dataIndex: "total_orders",
      key: "total_orders",
      render: (value: number) => (
        <Tag color="blue">{value.toLocaleString("vi-VN")}</Tag>
      ),
    },
    {
      title: t("dashboard.avg_order", "TB/đơn"),
      dataIndex: "average_order_value",
      key: "average_order_value",
      render: (value: number) => (
        <span className="text-gray-600">{formatCurrency(value)}</span>
      ),
    },
  ];

  const ordersColumns = [
    {
      title: "#",
      key: "rank",
      width: 50,
      render: (_: any, __: any, index: number) => getRankBadge(index),
    },
    {
      title: t("dashboard.customer", "Khách hàng"),
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name: string, record: TopCustomer) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: t("dashboard.total_orders", "Tổng đơn hàng"),
      dataIndex: "total_orders",
      key: "total_orders",
      render: (value: number) => (
        <span className="font-semibold text-blue-600">
          {value.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: t("dashboard.total_spent", "Tổng chi tiêu"),
      dataIndex: "total_spent",
      key: "total_spent",
      render: (value: number) => (
        <span className="text-gray-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: t("dashboard.avg_order", "TB/đơn"),
      dataIndex: "average_order_value",
      key: "average_order_value",
      render: (value: number) => (
        <span className="text-gray-600">{formatCurrency(value)}</span>
      ),
    },
  ];

  const debtColumns = [
    {
      title: "#",
      key: "rank",
      width: 50,
      render: (_: any, __: any, index: number) => getRankBadge(index),
    },
    {
      title: t("dashboard.customer", "Khách hàng"),
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name: string, record: TopDebtCustomer) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: t("dashboard.remaining_debt", "Còn nợ"),
      dataIndex: "remaining_debt",
      key: "remaining_debt",
      render: (value: number) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: t("dashboard.total_paid", "Đã trả"),
      dataIndex: "total_paid",
      key: "total_paid",
      render: (value: number) => (
        <span className="text-emerald-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: t("dashboard.pending_deposit", "Chờ cọc"),
      dataIndex: "pending_deposit_count",
      key: "pending_deposit_count",
      render: (value: number) => <Tag color="orange">{value}</Tag>,
    },
    {
      title: t("dashboard.pending_payment", "Chờ thanh toán"),
      dataIndex: "pending_payment_count",
      key: "pending_payment_count",
      render: (value: number) => <Tag color="red">{value}</Tag>,
    },
  ];

  const tabItems = [
    {
      key: "spending",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-500" />
          {t("dashboard.top_spending", "Chi tiêu cao")}
        </span>
      ),
      children: (
        <Skeleton loading={isLoadingSpending} active>
          {!topSpendingData || topSpendingData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <Empty description={t("dashboard.no_data", "Không có dữ liệu")} />
            </div>
          ) : (
            <Table
              dataSource={topSpendingData}
              columns={spendingColumns}
              pagination={false}
              size="small"
              rowKey="user_id"
            />
          )}
        </Skeleton>
      ),
    },
    {
      key: "orders",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faShoppingCart} className="text-blue-500" />
          {t("dashboard.top_orders", "Đặt hàng nhiều")}
        </span>
      ),
      children: (
        <Skeleton loading={isLoadingOrders} active>
          {!topOrdersData || topOrdersData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <Empty description={t("dashboard.no_data", "Không có dữ liệu")} />
            </div>
          ) : (
            <Table
              dataSource={topOrdersData}
              columns={ordersColumns}
              pagination={false}
              size="small"
              rowKey="user_id"
            />
          )}
        </Skeleton>
      ),
    },
    {
      key: "debt",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCreditCard} className="text-red-500" />
          {t("dashboard.top_debt", "Công nợ cao")}
        </span>
      ),
      children: (
        <Skeleton loading={isLoadingDebt} active>
          {!topDebtData || topDebtData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <Empty description={t("dashboard.no_data", "Không có dữ liệu")} />
            </div>
          ) : (
            <Table
              dataSource={topDebtData}
              columns={debtColumns}
              pagination={false}
              size="small"
              rowKey="user_id"
            />
          )}
        </Skeleton>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
          <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 m-0">
          {t("dashboard.top_customers", "Top khách hàng")}
        </h3>
      </div>
      <Tabs items={tabItems} size="small" />
    </div>
  );
};

export default TopCustomersTable;
