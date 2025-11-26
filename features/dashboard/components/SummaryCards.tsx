"use client";

import React from "react";
import { Card, Skeleton } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faExclamationTriangle,
  faCreditCard,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { AnalyticsSummary } from "@/types/analytics";

interface SummaryCardsProps {
  data?: AnalyticsSummary;
  isLoading: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();

  const cards = [
    {
      title: t("dashboard.pending_orders", "Đơn hàng chờ xử lý"),
      value: data?.pending_order_count ?? 0,
      icon: faClipboardList,
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
    },
    {
      title: t("dashboard.incomplete_orders", "Đơn hàng chưa hoàn thành"),
      value: data?.incomplete_order_count ?? 0,
      icon: faExclamationTriangle,
      gradient: "from-amber-500 to-amber-600",
      textColor: "text-amber-600",
    },
    {
      title: t("dashboard.highest_debt", "Công nợ cao nhất"),
      value: data?.highest_debt_customer?.remaining_debt ?? 0,
      subtitle: data?.highest_debt_customer?.customer_name,
      icon: faCreditCard,
      gradient: "from-red-500 to-red-600",
      textColor: "text-red-600",
      isCurrency: true,
    },
    {
      title: t("dashboard.top_spender", "Chi tiêu nhiều nhất"),
      value: data?.top_spending_customer?.total_spent ?? 0,
      subtitle: data?.top_spending_customer?.customer_name,
      icon: faTrophy,
      gradient: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      isCurrency: true,
    },
  ];

  const formatValue = (value: number, isCurrency?: boolean) => {
    if (isCurrency) {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
    }
    return value.toLocaleString("vi-VN");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-md border-0 overflow-hidden">
          <div
            className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.gradient}`}
          />
          <Skeleton loading={isLoading} active paragraph={{ rows: 2 }}>
            <div className="pt-2">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formatValue(card.value, card.isCurrency)}
                    {card.isCurrency && (
                      <span className="text-sm ml-1 text-gray-500">đ</span>
                    )}
                  </h2>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                >
                  <FontAwesomeIcon
                    icon={card.icon}
                    className="text-lg text-white"
                  />
                </div>
              </div>
            </div>
          </Skeleton>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;
