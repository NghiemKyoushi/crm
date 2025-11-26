"use client";

import React, { useState, useMemo } from "react";
import { Card, Segmented, Skeleton, Empty } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { OrderTimelineItem, TimelineGroupBy } from "@/types/analytics";

interface OrderTimelineChartProps {
  data?: OrderTimelineItem[];
  isLoading: boolean;
  onGroupByChange: (groupBy: TimelineGroupBy) => void;
  groupBy: TimelineGroupBy;
}

const OrderTimelineChart: React.FC<OrderTimelineChartProps> = ({
  data,
  isLoading,
  onGroupByChange,
  groupBy,
}) => {
  const { t } = useTranslation();

  const groupByOptions = [
    { label: t("dashboard.day", "Ngày"), value: "day" },
    { label: t("dashboard.week", "Tuần"), value: "week" },
    { label: t("dashboard.month", "Tháng"), value: "month" },
  ];

  const formatDate = (dateStr: string) => {
    switch (groupBy) {
      case "hour":
        return dayjs(dateStr).format("HH:mm");
      case "day":
        return dayjs(dateStr).format("DD/MM");
      case "week":
        return dateStr;
      case "month":
        return dayjs(dateStr + "-01").format("MM/YYYY");
      default:
        return dateStr;
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      formattedDate: formatDate(item.date),
    }));
  }, [data, groupBy]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === t("dashboard.revenue", "Doanh thu")
                ? `${formatCurrency(entry.value)}đ`
                : entry.value.toLocaleString("vi-VN")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md border-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">
          {t("dashboard.order_timeline", "Biểu đồ đơn hàng theo thời gian")}
        </h3>
        <Segmented
          options={groupByOptions}
          value={groupBy}
          onChange={(value) => onGroupByChange(value as TimelineGroupBy)}
          size="small"
        />
      </div>

      <Skeleton loading={isLoading} active paragraph={{ rows: 8 }}>
        {!data || data.length === 0 ? (
          <Empty
            description={t("dashboard.no_data", "Không có dữ liệu")}
            className="py-12"
          />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="order_count"
                name={t("dashboard.order_count", "Số đơn hàng")}
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorOrders)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="total_revenue"
                name={t("dashboard.revenue", "Doanh thu")}
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Skeleton>
    </Card>
  );
};

export default OrderTimelineChart;
