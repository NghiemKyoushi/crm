"use client";

import React from "react";
import { Card, Table, Skeleton, Empty, Progress, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { SalesPerformance } from "@/types/analytics";

interface SalesPerformanceTableProps {
  data?: SalesPerformance[];
  isLoading: boolean;
}

const SalesPerformanceTable: React.FC<SalesPerformanceTableProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useTranslation();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B đ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M đ`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K đ`;
    return `${value.toLocaleString("vi-VN")} đ`;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 80) return "#52c41a";
    if (rate >= 60) return "#1890ff";
    if (rate >= 40) return "#faad14";
    return "#ff4d4f";
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: any, __: any, index: number) => (
        <span className="text-gray-500 font-medium">{index + 1}</span>
      ),
    },
    {
      title: t("dashboard.sales_staff", "Nhân viên"),
      dataIndex: "sales_name",
      key: "sales_name",
      render: (name: string, record: SalesPerformance) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("dashboard.customers", "Khách hàng"),
      dataIndex: "total_customers",
      key: "total_customers",
      render: (value: number) => (
        <Tag icon={<FontAwesomeIcon icon={faUsers} className="mr-1" />} color="blue">
          {value.toLocaleString("vi-VN")}
        </Tag>
      ),
    },
    {
      title: t("dashboard.orders", "Đơn hàng"),
      dataIndex: "total_orders",
      key: "total_orders",
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {value.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: t("dashboard.revenue", "Doanh thu"),
      dataIndex: "total_revenue",
      key: "total_revenue",
      render: (value: number) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: t("dashboard.avg_order_value", "Giá trị TB"),
      dataIndex: "average_order_value",
      key: "average_order_value",
      render: (value: number) => (
        <span className="text-gray-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: t("dashboard.conversion_rate", "Tỉ lệ chuyển đổi"),
      dataIndex: "conversion_rate",
      key: "conversion_rate",
      render: (value: number) => (
        <div className="w-24">
          <Progress
            percent={value}
            size="small"
            strokeColor={getConversionColor(value)}
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
        </div>
      ),
    },
  ];

  return (
    <Card className="shadow-md border-0 h-full" styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
          <FontAwesomeIcon icon={faUsers} className="text-white" />
        </div>
        <h3 className="text-base font-bold text-gray-900">
          {t("dashboard.sales_performance", "Hiệu suất nhân viên bán hàng")}
        </h3>
      </div>
      <div className="flex-1 min-h-[300px]">
        <Skeleton loading={isLoading} active>
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center h-[260px]">
              <Empty description={t("dashboard.no_data", "Không có dữ liệu")} />
            </div>
          ) : (
            <Table
              dataSource={data}
              columns={columns}
              pagination={false}
              size="small"
              rowKey="sales_id"
              scroll={{ x: 800 }}
            />
          )}
        </Skeleton>
      </div>
    </Card>
  );
};

export default SalesPerformanceTable;
