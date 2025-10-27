"use client";

import React from "react";
import { Card, Row, Col, Statistic, Progress, Spin, Empty } from "antd";
import { useTranslation } from "react-i18next";
import { useFifoBalance } from "../hooks/partner-manage-hook";
import { CurrencyBalance } from "@/types/partner";

export const FifoBalanceCards: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useFifoBalance();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin size="large" tip={t("partnerManage.loading")} />
      </div>
    );
  }

  if (error || !data?.data || data.data.length === 0) {
    return (
      <Card>
        <Empty description={t("partnerManage.noData")} />
      </Card>
    );
  }

  const currencyBalances = data.data;

  const getCurrencyColor = (currencyCode: string): string => {
    switch (currencyCode) {
      case "JPY":
        return "#FF6B6B";
      case "USD":
        return "#4ECDC4";
      default:
        return "#95E1D3";
    }
  };

  const calculateProgress = (balance: CurrencyBalance): number => {
    if (balance.totalIncoming === 0) return 0;
    return Math.round((balance.fifoBalance / balance.totalIncoming) * 100);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {t("partnerManage.fifoBalanceTitle")}
      </h3>
      <div className="flex gap-4">
        {currencyBalances.map((balance) => {
          const progress = calculateProgress(balance);
          const color = getCurrencyColor(balance.currencyCode);

          return (
            <div key={balance.currencyCode} className="flex-1">
              <Card
                className="h-full"
                bordered={false}
                style={{
                  borderLeft: `4px solid ${color}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div className="mb-4">
                  <h4
                    className="text-xl font-bold mb-2"
                    style={{ color: color }}
                  >
                    {balance.currencyCode}
                  </h4>
                  <div className="text-3xl font-bold text-gray-800">
                    {formatNumber(balance.fifoBalance)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t("partnerManage.fifoBalance")}
                  </div>
                </div>

                <div className="mb-4">
                  <Progress
                    percent={progress}
                    strokeColor={color}
                    trailColor="#e0e0e0"
                    showInfo={true}
                    format={(percent) => `${percent}%`}
                  />
                </div>

                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Statistic
                      title={
                        <span className="text-xs text-gray-500">
                          {t("partnerManage.totalIncoming")}
                        </span>
                      }
                      value={formatNumber(balance.totalIncoming)}
                      valueStyle={{ fontSize: "14px", color: "#52c41a" }}
                      prefix="+"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={
                        <span className="text-xs text-gray-500">
                          {t("partnerManage.totalOutgoing")}
                        </span>
                      }
                      value={formatNumber(balance.totalOutgoing)}
                      valueStyle={{ fontSize: "14px", color: "#ff4d4f" }}
                      prefix="-"
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title={
                        <span className="text-xs text-gray-500">
                          {t("partnerManage.transactionCount")}
                        </span>
                      }
                      value={balance.transactionCount}
                      valueStyle={{ fontSize: "14px", color: "#1890ff" }}
                      suffix={t("partnerManage.itemsPerPage").split("/")[0]}
                    />
                  </Col>
                </Row>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
