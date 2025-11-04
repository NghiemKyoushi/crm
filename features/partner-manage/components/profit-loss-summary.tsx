"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Select, Spin, Empty, Tag } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useProfitLossSummary } from "../hooks/partner-manage-hook";
import { ProfitLossSummary } from "@/types/partner";
import { profitLossCurrencyCodes } from "./profit-loss-chart";

const { Option } = Select;

export const ProfitLossSummaryComponent: React.FC<{ code?: string }> = ({ code }) => {
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(
    undefined
  );
  const { data, isLoading, error } = useProfitLossSummary(selectedCurrency);

  useEffect(()=>{
    if(code){
      setSelectedCurrency(code)
    }
  },[code])
  if (isLoading) {
    return (
      <div className="mb-6 w-full">
        <div className="flex justify-center items-center py-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <Spin size="large" tip={t("partnerManage.loading")} />
        </div>
      </div>
    );
  }

  if (error || !data?.data || data.data.length === 0) {
    return (
      <div className="mb-6 w-full">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <Empty description={t("partnerManage.noData")} />
        </div>
      </div>
    );
  }

  const summaries = data.data;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(num));
  };

  const calculateProfitMargin = (summary: ProfitLossSummary): number => {
    if (summary.avgCostRate === 0) return 0;
    return (
      ((summary.avgSellRate - summary.avgCostRate) / summary.avgCostRate) *
      100
    );
  };

  const renderSummaryCard = (summary: ProfitLossSummary) => {
    const isProfit = summary.totalProfitLossVnd > 0;
    const profitMargin = calculateProfitMargin(summary);

    return (
      <div key={summary.currencyCode} className="flex-1">
        <Card
          className="h-full"
          bordered={false}
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderTop: `4px solid ${isProfit ? "#52c41a" : "#ff4d4f"}`,
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xl font-bold text-gray-800">
              {summary.currencyCode}
            </h4>
            <Tag color={isProfit ? "success" : "error"}>
              {isProfit
                ? t("partnerManage.profit")
                : t("partnerManage.loss")}
            </Tag>
          </div>

          {/* Total Profit/Loss */}
          <div className="mb-4">
            <Statistic
              title={t("partnerManage.totalProfitLoss")}
              value={formatCurrency(Math.abs(summary.totalProfitLossVnd))}
              precision={0}
              valueStyle={{
                color: isProfit ? "#52c41a" : "#ff4d4f",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              prefix={isProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix={t("partnerManage.currencySymbol")}
            />
          </div>

          {/* Total Consumed */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">
              {t("partnerManage.totalConsumed")}
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {formatNumber(summary.totalConsumed)} {summary.currencyCode}
            </div>
          </div>

          {/* Exchange Rates Comparison */}
          <Row gutter={[8, 8]} className="mb-3">
            <Col span={12}>
              <div className="bg-red-50 p-2 rounded">
                <div className="text-xs text-gray-500">
                  {t("partnerManage.avgCostRate")}
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatNumber(summary.avgCostRate)}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xs text-gray-500">
                  {t("partnerManage.avgSellRate")}
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatNumber(summary.avgSellRate)}
                </div>
              </div>
            </Col>
          </Row>

          {/* Profit Margin */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {t("partnerManage.profitMargin")}
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: isProfit ? "#52c41a" : "#ff4d4f" }}
              >
                {profitMargin > 0 ? "+" : ""}
                {profitMargin.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Consumption Count */}
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {t("partnerManage.orderCount")}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {summary.consumptionCount}{" "}
                {t("partnerManage.itemsPerPage").split("/")[0]}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {t("partnerManage.profitLossSummaryTitle")}
        </h3>
        <Select
          style={{ width: 150 }}
          placeholder={t("partnerManage.selectCurrency")}
          allowClear
          value={selectedCurrency}
          onChange={(value) => setSelectedCurrency(value)}
        >
          <Option value={undefined}>
            {t("partnerManage.selectCurrency")}
          </Option>
          {profitLossCurrencyCodes.map((cod) => {
                return(
                  <Option value={cod} key={cod}>
                    {cod}
                  </Option>
                )
            })}
        </Select>
      </div>

      <div className="flex gap-4">
        {summaries.map((summary) => renderSummaryCard(summary))}
      </div>
    </div>
  );
};
