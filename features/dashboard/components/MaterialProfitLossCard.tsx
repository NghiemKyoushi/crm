"use client";

import React from "react";
import { Card, Table, Skeleton, Empty, Tag, DatePicker } from "antd";
import {
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Dayjs } from "dayjs";
import { MaterialProfitLoss } from "@/types/analytics";

const { RangePicker } = DatePicker;

interface MaterialProfitLossCardProps {
  data?: MaterialProfitLoss[];
  isLoading: boolean;
  dateRange: [Dayjs | null, Dayjs | null];
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
}

const MaterialProfitLossCard: React.FC<MaterialProfitLossCardProps> = ({
  data,
  isLoading,
  dateRange,
  onDateRangeChange,
}) => {
  const { t } = useTranslation();

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      JPY: "¥",
      USD: "$",
      VND: "đ",
      EUR: "€",
    };
    return symbols[code] || code;
  };

  const formatAmount = (value: number, currencyCode: string) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 2,
    });
    return `${formatter.format(value)} ${getCurrencySymbol(currencyCode)}`;
  };

  const columns = [
    {
      title: t("dashboard.partner", "Đối tác"),
      dataIndex: "partner_name",
      key: "partner_name",
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      ),
    },
    {
      title: t("dashboard.currency", "Tiền tệ"),
      dataIndex: "currency_code",
      key: "currency_code",
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: t("dashboard.total_inflow", "Tổng nhập"),
      dataIndex: "total_inflow",
      key: "total_inflow",
      render: (value: number, record: MaterialProfitLoss) => (
        <span className="text-blue-600">
          {formatAmount(value, record.currency_code)}
        </span>
      ),
    },
    {
      title: t("dashboard.total_outflow", "Tổng xuất"),
      dataIndex: "total_outflow",
      key: "total_outflow",
      render: (value: number, record: MaterialProfitLoss) => (
        <span className="text-orange-600">
          {formatAmount(value, record.currency_code)}
        </span>
      ),
    },
    {
      title: t("dashboard.current_balance", "Số dư"),
      dataIndex: "current_balance",
      key: "current_balance",
      render: (value: number, record: MaterialProfitLoss) => (
        <span className="font-semibold text-gray-900">
          {formatAmount(value, record.currency_code)}
        </span>
      ),
    },
    {
      title: t("dashboard.profit_loss", "Lãi/Lỗ"),
      dataIndex: "realized_profit_loss",
      key: "realized_profit_loss",
      render: (value: number, record: MaterialProfitLoss) => {
        const isProfit = value >= 0;
        return (
          <span
            className={`font-semibold flex items-center gap-1 ${
              isProfit ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isProfit ? (
              <ArrowUpOutlined className="text-xs" />
            ) : (
              <ArrowDownOutlined className="text-xs" />
            )}
            {formatAmount(Math.abs(value), record.currency_code)}
          </span>
        );
      },
    },
    {
      title: t("dashboard.transactions", "Giao dịch"),
      dataIndex: "transaction_count",
      key: "transaction_count",
      render: (value: number) => (
        <Tag color="cyan">{value.toLocaleString("vi-VN")}</Tag>
      ),
    },
  ];

  const summary = React.useMemo(() => {
    if (!data) return { totalProfit: 0, totalLoss: 0 };
    const totalProfit = data
      .filter((d) => d.realized_profit_loss >= 0)
      .reduce((sum, d) => sum + d.realized_profit_loss, 0);
    const totalLoss = data
      .filter((d) => d.realized_profit_loss < 0)
      .reduce((sum, d) => sum + Math.abs(d.realized_profit_loss), 0);
    return { totalProfit, totalLoss };
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
            <LineChartOutlined className="text-teal-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 m-0">
              {t("dashboard.material_profit_loss", "Lãi/Lỗ nguyên liệu (FIFO)")}
            </h3>
            <p className="text-xs text-gray-500 m-0 flex gap-3">
              <span className="text-emerald-600">
                {t("dashboard.profit", "Lãi")}: +{summary.totalProfit.toLocaleString("vi-VN")}
              </span>
              <span className="text-red-600">
                {t("dashboard.loss", "Lỗ")}: -{summary.totalLoss.toLocaleString("vi-VN")}
              </span>
            </p>
          </div>
        </div>
        <RangePicker
          value={dateRange}
          onChange={(dates) =>
            onDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)
          }
          format="DD/MM/YYYY"
          allowClear={false}
          size="small"
        />
      </div>
      <Skeleton loading={isLoading} active>
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <Empty description={t("dashboard.no_data", "Không có dữ liệu")} />
          </div>
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="partner_id"
            scroll={{ x: 800 }}
          />
        )}
      </Skeleton>
    </div>
  );
};

export default MaterialProfitLossCard;
