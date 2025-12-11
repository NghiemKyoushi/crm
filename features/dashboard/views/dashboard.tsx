"use client";

import React, { useState, useMemo } from "react";
import { Row, Col, Alert } from "antd";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";
import { TimelineGroupBy } from "@/types/analytics";
import {
  useAnalyticsSummary,
  useTopDebtCustomers,
  useTopOrderCustomers,
  useTopSpendingCustomers,
  useNewCustomers,
  useTopOrderedProducts,
  useSalesPerformance,
  useOrderTimeline,
  usePendingOrders,
  useMaterialProfitLoss,
} from "../hooks/useAnalytics";
import {
  SummaryCards,
  OrderTimelineChart,
  TopCustomersTable,
  SalesPerformanceTable,
  TopProductsTable,
  NewCustomersCard,
  PendingOrdersCard,
  MaterialProfitLossCard,
} from "../components";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  // State for filters
  const [timelineGroupBy, setTimelineGroupBy] = useState<TimelineGroupBy>("day");
  const [newCustomersDateRange, setNewCustomersDateRange] = useState<
    [Dayjs | null, Dayjs | null]
  >([dayjs().subtract(30, "day"), dayjs()]);
  const [materialDateRange, setMaterialDateRange] = useState<
    [Dayjs | null, Dayjs | null]
  >([dayjs().subtract(30, "day"), dayjs()]);

  // Calculate date params
  const timelineParams = useMemo(
    () => ({
      from_date: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
      to_date: dayjs().format("YYYY-MM-DD"),
      group_by: timelineGroupBy,
    }),
    [timelineGroupBy]
  );

  const newCustomersParams = useMemo(
    () => ({
      from_date: newCustomersDateRange[0]?.format("YYYY-MM-DD"),
      to_date: newCustomersDateRange[1]?.format("YYYY-MM-DD"),
    }),
    [newCustomersDateRange]
  );

  const materialParams = useMemo(
    () => ({
      from_date: materialDateRange[0]?.format("YYYY-MM-DD"),
      to_date: materialDateRange[1]?.format("YYYY-MM-DD"),
      limit: 10,
    }),
    [materialDateRange]
  );

  // Fetch data
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } =
    useAnalyticsSummary();
  const { data: topDebtData, isLoading: topDebtLoading } = useTopDebtCustomers({
    limit: 10,
  });
  const { data: topOrdersData, isLoading: topOrdersLoading } =
    useTopOrderCustomers({ limit: 10 });
  const { data: topSpendingData, isLoading: topSpendingLoading } =
    useTopSpendingCustomers({ limit: 10 });
  const { data: newCustomersData, isLoading: newCustomersLoading } =
    useNewCustomers(newCustomersParams);
  const { data: topProductsData, isLoading: topProductsLoading } =
    useTopOrderedProducts({ limit: 10 });
  const { data: salesPerformanceData, isLoading: salesPerformanceLoading } =
    useSalesPerformance({ limit: 10 });
  const { data: orderTimelineData, isLoading: orderTimelineLoading } =
    useOrderTimeline(timelineParams);
  const { data: pendingOrdersData, isLoading: pendingOrdersLoading } =
    usePendingOrders();
  const { data: materialData, isLoading: materialLoading } =
    useMaterialProfitLoss(materialParams);

  // Handle errors
  if (summaryError) {
    return (
      <div className="p-5">
        <Alert
          message={t("dashboard.error", "Lỗi")}
          description={t(
            "dashboard.load_error",
            "Không thể tải dữ liệu dashboard. Vui lòng thử lại sau."
          )}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 m-0">
            {t("dashboard.title", "Dashboard")}
          </h1>
          <p className="text-xs text-gray-500 mt-1 m-0">
            {t("dashboard.subtitle", "Tổng quan hệ thống Stream Cargo")}
          </p>
        </div>
      </div>

      <div className="p-4">

      {/* ==================== TỔNG QUAN ==================== */}
      {/* Summary Cards */}
      <div className="mb-5">
        <SummaryCards data={summaryData?.data} isLoading={summaryLoading} />
      </div>

      {/* Order Timeline Chart */}
      <div className="mb-6">
        <OrderTimelineChart
          data={orderTimelineData?.data}
          isLoading={orderTimelineLoading}
          groupBy={timelineGroupBy}
          onGroupByChange={setTimelineGroupBy}
        />
      </div>

      {/* ==================== ĐƠN HÀNG & SẢN PHẨM ==================== */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {t("dashboard.orders_products", "Đơn hàng & Sản phẩm")}
        </h2>
      </div>

      {/* Pending Orders - Full Width */}
      <div className="mb-5">
        <PendingOrdersCard
          data={pendingOrdersData?.data}
          isLoading={pendingOrdersLoading}
        />
      </div>

      {/* Top Products - Full Width */}
      {/* <div className="mb-6">
        <TopProductsTable
          data={topProductsData?.data}
          isLoading={topProductsLoading}
        />
      </div> */}

      {/* ==================== KHÁCH HÀNG & NHÂN VIÊN ==================== */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {t("dashboard.customers_section", "Khách hàng")}
        </h2>
      </div>

      {/* Top Customers - Full Width */}
      <div className="mb-5">
        <TopCustomersTable
          topSpendingData={topSpendingData?.data}
          topOrdersData={topOrdersData?.data}
          topDebtData={topDebtData?.data}
          isLoadingSpending={topSpendingLoading}
          isLoadingOrders={topOrdersLoading}
          isLoadingDebt={topDebtLoading}
        />
      </div>

      {/* Sales Performance - Full Width */}
      <div className="mb-5">
        <SalesPerformanceTable
          data={salesPerformanceData?.data}
          isLoading={salesPerformanceLoading}
        />
      </div>

      {/* New Customers - Full Width */}
      <div className="mb-6">
        <NewCustomersCard
          data={newCustomersData?.data}
          isLoading={newCustomersLoading}
          dateRange={newCustomersDateRange}
          onDateRangeChange={(dates) => {
            if (dates) {
              setNewCustomersDateRange(dates);
            }
          }}
        />
      </div>

      {/* ==================== TÀI CHÍNH & NGUYÊN LIỆU ==================== */}
      {/* <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {t("dashboard.finance_materials", "Tài chính & Nguyên liệu")}
        </h2>
      </div> */}

      {/* Material Profit/Loss - Full Width */}
      {/* <div>
        <MaterialProfitLossCard
          data={materialData?.data}
          isLoading={materialLoading}
          dateRange={materialDateRange}
          onDateRangeChange={(dates) => {
            if (dates) {
              setMaterialDateRange(dates);
            }
          }}
        />
      </div> */}
      </div>
    </div>
  );
};

export default DashboardPage;
