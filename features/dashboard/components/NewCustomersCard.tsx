"use client";

import React from "react";
import { Card, Table, Skeleton, Empty, Tag, DatePicker } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";
import { NewCustomer } from "@/types/analytics";

const { RangePicker } = DatePicker;

interface NewCustomersCardProps {
  data?: NewCustomer[];
  isLoading: boolean;
  dateRange: [Dayjs | null, Dayjs | null];
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
}

const NewCustomersCard: React.FC<NewCustomersCardProps> = ({
  data,
  isLoading,
  dateRange,
  onDateRangeChange,
}) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("dashboard.customer", "Khách hàng"),
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name: string, record: NewCustomer) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: t("dashboard.phone", "Số điện thoại"),
      dataIndex: "phone_number",
      key: "phone_number",
      render: (phone: string) => (
        <span className="text-gray-600">{phone || "-"}</span>
      ),
    },
    {
      title: t("dashboard.sales", "Nhân viên"),
      dataIndex: "sales_name",
      key: "sales_name",
      render: (name: string | null) =>
        name ? (
          <Tag color="blue">{name}</Tag>
        ) : (
          <Tag color="default">{t("dashboard.unassigned", "Chưa gán")}</Tag>
        ),
    },
    {
      title: t("dashboard.has_ordered", "Đã đặt hàng"),
      dataIndex: "has_placed_order",
      key: "has_placed_order",
      render: (hasOrdered: boolean) =>
        hasOrdered ? (
          <Tag color="success" icon={<FontAwesomeIcon icon={faCheck} className="mr-1" />}>
            {t("dashboard.yes", "Có")}
          </Tag>
        ) : (
          <Tag color="default" icon={<FontAwesomeIcon icon={faTimes} className="mr-1" />}>
            {t("dashboard.no", "Chưa")}
          </Tag>
        ),
    },
    {
      title: t("dashboard.registered_at", "Ngày đăng ký"),
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span className="text-gray-600 text-sm">
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
  ];

  const stats = React.useMemo(() => {
    if (!data) return { total: 0, withOrders: 0, withoutOrders: 0 };
    const withOrders = data.filter((c) => c.has_placed_order).length;
    return {
      total: data.length,
      withOrders,
      withoutOrders: data.length - withOrders,
    };
  }, [data]);

  return (
    <Card className="shadow-md border-0 h-full" styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faUserPlus} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {t("dashboard.new_customers", "Khách hàng mới")}
            </h3>
            <div className="text-xs text-gray-500 flex gap-3">
              <span>
                {t("dashboard.total", "Tổng")}: {stats.total}
              </span>
              <span className="text-emerald-600">
                {t("dashboard.with_orders", "Đã mua")}: {stats.withOrders}
              </span>
              <span className="text-amber-600">
                {t("dashboard.without_orders", "Chưa mua")}: {stats.withoutOrders}
              </span>
            </div>
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
      <div className="flex-1 min-h-[280px]">
        <Skeleton loading={isLoading} active>
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <Empty description={t("dashboard.no_data", "Không có dữ liệu")} />
            </div>
          ) : (
            <Table
              dataSource={data}
              columns={columns}
              pagination={{ pageSize: 5, size: "small" }}
              size="small"
              rowKey="user_id"
              scroll={{ x: 700 }}
            />
          )}
        </Skeleton>
      </div>
    </Card>
  );
};

export default NewCustomersCard;
