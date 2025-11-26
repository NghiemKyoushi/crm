"use client";

import React from "react";
import { Card, Table, Skeleton, Empty, Tag, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { PendingOrder } from "@/types/analytics";

interface PendingOrdersCardProps {
  data?: PendingOrder[];
  isLoading: boolean;
}

const PendingOrdersCard: React.FC<PendingOrdersCardProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useTranslation();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysPendingColor = (days: number) => {
    if (days >= 7) return "red";
    if (days >= 3) return "orange";
    return "green";
  };

  const columns = [
    {
      title: t("dashboard.invoice", "Mã đơn"),
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (invoice: string) => (
        <span className="font-medium text-blue-600">{invoice}</span>
      ),
    },
    {
      title: t("dashboard.customer", "Khách hàng"),
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      ),
    },
    {
      title: t("dashboard.amount", "Số tiền"),
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: t("dashboard.status", "Trạng thái"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="processing">{status}</Tag>,
    },
    {
      title: t("dashboard.days_pending", "Số ngày chờ"),
      dataIndex: "days_pending",
      key: "days_pending",
      render: (days: number) => (
        <Tooltip
          title={
            days >= 7
              ? t("dashboard.urgent", "Cần xử lý gấp!")
              : days >= 3
              ? t("dashboard.attention", "Cần chú ý")
              : t("dashboard.normal", "Bình thường")
          }
        >
          <Tag
            color={getDaysPendingColor(days)}
            icon={
              days >= 3 ? (
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              ) : (
                <FontAwesomeIcon icon={faClock} className="mr-1" />
              )
            }
          >
            {days} {t("dashboard.days", "ngày")}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: t("dashboard.created_at", "Ngày tạo"),
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span className="text-gray-600 text-sm">
          {dayjs(date).format("DD/MM/YYYY")}
        </span>
      ),
    },
  ];

  const urgentCount = React.useMemo(() => {
    if (!data) return 0;
    return data.filter((order) => order.days_pending >= 3).length;
  }, [data]);

  return (
    <Card className="shadow-md border-0 h-full" styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {t("dashboard.pending_orders", "Đơn hàng đang chờ xử lý")}
          </h3>
          <div className="text-xs text-gray-500">
            {data?.length ?? 0} {t("dashboard.orders", "đơn hàng")}
            {urgentCount > 0 && (
              <span className="text-red-600 ml-2">
                ({urgentCount} {t("dashboard.need_attention", "cần chú ý")})
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[280px]">
        <Skeleton loading={isLoading} active>
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <Empty
                description={t(
                  "dashboard.no_pending_orders",
                  "Không có đơn hàng chờ xử lý"
                )}
              />
            </div>
          ) : (
            <Table
              dataSource={data}
              columns={columns}
              pagination={{ pageSize: 5, size: "small" }}
              size="small"
              rowKey="order_id"
              scroll={{ x: 800 }}
            />
          )}
        </Skeleton>
      </div>
    </Card>
  );
};

export default PendingOrdersCard;
