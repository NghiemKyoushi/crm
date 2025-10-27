"use client";

import React, { useState } from "react";
import { Card, DatePicker, Select, Button, Empty, Spin } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useProfitLossByDate } from "../hooks/partner-manage-hook";
import dayjs from "@/utils/dayjs-config";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export const ProfitLossChart: React.FC = () => {
  const { t } = useTranslation();
  const [currencyCode, setCurrencyCode] = useState<string>("JPY");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  const { data, isLoading, refetch } = useProfitLossByDate({
    currency_code: currencyCode,
    start_date: dateRange[0].format("YYYY-MM-DD"),
    end_date: dateRange[1].format("YYYY-MM-DD"),
  });

  const handleDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  const formatDate = (dateStr: string): string => {
    return dayjs(dateStr).format("DD/MM");
  };

  // Transform API data to chart format
  const chartData =
    data?.data.map((item) => ({
      date: formatDate(item[0]),
      fullDate: item[0],
      currencyCode: item[1],
      consumed: item[2],
      profitLoss: item[3],
      orderCount: item[4],
    })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isProfit = data.profitLoss > 0;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {dayjs(data.fullDate).format("DD/MM/YYYY")}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">
              {t("partnerManage.consumed")}:{" "}
              <span className="font-semibold">
                {data.consumed.toLocaleString()} {data.currencyCode}
              </span>
            </p>
            <p className="text-xs text-gray-600">
              {t("partnerManage.profitLoss")}:{" "}
              <span
                className="font-semibold"
                style={{ color: isProfit ? "#52c41a" : "#ff4d4f" }}
              >
                {isProfit ? "+" : ""}
                {data.profitLoss.toLocaleString()} {t("partnerManage.currencySymbol")}
              </span>
            </p>
            <p className="text-xs text-gray-600">
              {t("partnerManage.orderCount")}:{" "}
              <span className="font-semibold">{data.orderCount}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6 w-full">
      <div className="flex justify-between items-center flex-wrap gap-3 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold m-0">
          {t("partnerManage.profitLossByDateTitle")}
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={currencyCode}
            onChange={setCurrencyCode}
            style={{ width: 100 }}
          >
            <Option value="JPY">JPY</Option>
            <Option value="USD">USD</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            style={{ width: 250 }}
            placeholder={[
              t("partnerManage.startDate"),
              t("partnerManage.endDate"),
            ]}
          />
          <Button type="primary" onClick={() => refetch()}>
            {t("partnerManage.generateReport")}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" tip={t("partnerManage.loading")} />
        </div>
      ) : chartData.length === 0 ? (
        <Empty
          description={t("partnerManage.noData")}
          className="py-16"
        />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#888"
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                if (value === "profitLoss")
                  return t("partnerManage.profitLoss");
                return value;
              }}
            />
            <Bar
              dataKey="profitLoss"
              radius={[8, 8, 0, 0]}
              label={{
                position: "top",
                formatter: (value: any) =>
                  value !== 0 ? formatCurrency(value) : "",
                fontSize: 10,
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profitLoss >= 0 ? "#52c41a" : "#ff4d4f"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      {!isLoading && chartData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {t("partnerManage.totalConsumed")}
              </div>
              <div className="text-lg font-bold text-gray-800">
                {chartData
                  .reduce((sum, item) => sum + item.consumed, 0)
                  .toLocaleString()}{" "}
                {currencyCode}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {t("partnerManage.totalProfitLoss")}
              </div>
              <div
                className="text-lg font-bold"
                style={{
                  color:
                    chartData.reduce((sum, item) => sum + item.profitLoss, 0) >=
                    0
                      ? "#52c41a"
                      : "#ff4d4f",
                }}
              >
                {chartData
                  .reduce((sum, item) => sum + item.profitLoss, 0)
                  .toLocaleString()}{" "}
                {t("partnerManage.currencySymbol")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {t("partnerManage.orderCount")}
              </div>
              <div className="text-lg font-bold text-gray-800">
                {chartData.reduce((sum, item) => sum + item.orderCount, 0)}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
