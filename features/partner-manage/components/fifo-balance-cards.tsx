"use client";

import React from "react";
import { Card, Row, Col, Statistic, Progress, Spin, Empty } from "antd";
import { useTranslation } from "react-i18next";
import { useFifoBalance } from "../hooks/partner-manage-hook";
import { CurrencyBalance } from "@/types/partner";

interface FifoBalanceCardsProps {
  JP?: boolean;
  US?: boolean;
}

export const FifoBalanceCards: React.FC<FifoBalanceCardsProps> = ({ JP, US }) => {
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

  // Filter currencyBalances according to JP/US props
  let currencyBalances = data.data;
  if (JP && !US) {
    currencyBalances = currencyBalances.filter((item) =>
      item.currencyCode.includes("JP")
    );
  } else if (US && !JP) {
    currencyBalances = currencyBalances.filter((item) =>
      item.currencyCode.includes("US")
    );
  }
  // If both or none are provided, show all

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
    <div className="mb-3">
      <div className="flex gap-3">
        {currencyBalances.map((balance) => {
          const progress = calculateProgress(balance);
          const color = getCurrencyColor(balance.currencyCode);

          return (
            <div key={balance.currencyCode} className="flex-1">
              <Card
                size="small"
                bordered={false}
                bodyStyle={{ padding: "12px" }}
                style={{
                  borderLeft: `3px solid ${color}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4
                      className="text-xs font-semibold m-0 mb-0.5"
                      style={{ color: color }}
                    >
                      {balance.currencyCode}
                    </h4>
                    <div className="text-base font-bold text-gray-800 leading-tight">
                      {formatNumber(balance.fifoBalance)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Tồn kho
                    </div>
                  </div>
                  <Progress
                    type="circle"
                    percent={progress}
                    strokeColor={color}
                    width={36}
                    strokeWidth={8}
                    format={(percent) => (
                      <span style={{ fontSize: "9px", color: "#666" }}>
                        {percent}%
                      </span>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <div style={{ fontSize: "10px" }} className="text-gray-400">
                      Nhập
                    </div>
                    <div style={{ fontSize: "11px" }} className="font-semibold text-green-600">
                      +{formatNumber(balance.totalIncoming)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: "10px" }} className="text-gray-400">
                      Xuất
                    </div>
                    <div style={{ fontSize: "11px" }} className="font-semibold text-red-600">
                      -{formatNumber(balance.totalOutgoing)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: "10px" }} className="text-gray-400">
                      GD
                    </div>
                    <div style={{ fontSize: "11px" }} className="font-semibold text-blue-600">
                      {balance.transactionCount}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
