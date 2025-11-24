"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  App,
  Input,
  Tag,
  Space,
  Tooltip,
  DatePicker,
} from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListMaterial,
  useDeleteMaterial,
  useRecalculateFifo,
} from "../hooks/partner-manage-hook";
import { PartnerTransaction } from "@/types/partner";
import type { ColumnsType } from "antd/es/table";
import dayjs from "@/utils/dayjs-config";

interface TransactionListProps {
  currencyCode: string;
  onAddTransaction?: () => void;
  dateRange?: [any, any];
  onDateRangeChange?: (dates: [any, any]) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  currencyCode,
  onAddTransaction,
  dateRange,
  onDateRangeChange,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { modal, message } = App.useApp();
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchText, setSearchText] = useState<string>("");
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PartnerTransaction | null>(null);

  // Build query params with date range
  const queryParams: any = {
    page,
    page_size: pageSize,
    search: searchText,
    currency_code: currencyCode,
  };

  if (dateRange && dateRange[0] && dateRange[1]) {
    queryParams.from_date = dateRange[0].format("YYYY-MM-DD");
    queryParams.to_date = dateRange[1].format("YYYY-MM-DD");
  }

  const { data, isLoading, refetch } = useListMaterial(queryParams);

  const deleteMutation = useDeleteMaterial();
  const recalculateMutation = useRecalculateFifo();

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    try {
      await deleteMutation.mutateAsync({ id: selectedTransaction.id });
      message.success(t("partnerManage.deleteMaterialSuccess"));

      // Recalculate FIFO after deletion
      await recalculateMutation.mutateAsync({ currencyCode });
      message.success(t("partnerManage.recalculateFifoSuccess"));

      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ["listMaterial"] });
      queryClient.invalidateQueries({ queryKey: ["fifoBalance"] });
      queryClient.invalidateQueries({ queryKey: ["profitLossSummary"] });

      setDeleteModalVisible(false);
      setSelectedTransaction(null);
    } catch (error: any) {
      message.error(error.message || "Error deleting transaction");
    }
  };

  const handleRecalculate = async () => {
    console.log('handleRecalculate clicked, currencyCode:', currencyCode);

    modal.confirm({
      title: t("partnerManage.recalculateFifo"),
      content: t("partnerManage.recalculateFifoConfirm"),
      okText: t("partnerManage.saveButton"),
      cancelText: t("partnerManage.cancelButton"),
      onOk: async () => {
        console.log('Modal OK clicked!');
        try {
          console.log('Calling recalculateMutation with:', { currencyCode });
          const result = await recalculateMutation.mutateAsync({ currencyCode });
          console.log('Recalculate result:', result);
          message.success(t("partnerManage.recalculateFifoSuccess"));

          // Refresh all queries
          queryClient.invalidateQueries({ queryKey: ["listMaterial"] });
          queryClient.invalidateQueries({ queryKey: ["fifoBalance"] });
          queryClient.invalidateQueries({ queryKey: ["profitLossSummary"] });
        } catch (error: any) {
          console.error('Recalculate error:', error);
          message.error(error.message || "Error recalculating FIFO");
        }
      },
      onCancel: () => {
        console.log('Modal cancelled');
      },
    });

    console.log('modal.confirm called');
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const columns: ColumnsType<PartnerTransaction> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: number) => (
        <span className="font-mono text-sm text-gray-600">#{id}</span>
      ),
    },
    {
      title: t("partnerManage.partner"),
      dataIndex: "partnerName",
      key: "partnerName",
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string, record) => (
        <Tooltip
          title={
            <div>
              <div>{name}</div>
              {record.bankName && <div className="text-xs mt-1">{record.bankName}</div>}
            </div>
          }
          placement="topLeft"
        >
          <div className="cursor-pointer">
            <div className="text-sm text-gray-800 truncate">{name}</div>
            {record.bankName && (
              <div className="text-xs text-gray-500 truncate">{record.bankName}</div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: t("partnerManage.transactionType"),
      key: "transactionType",
      width: 130,
      align: "center",
      render: (_, record) => {
        const isIncoming = record.amount > 0;
        return (
          <Tag color={isIncoming ? "success" : "error"}>
            {isIncoming
              ? t("partnerManage.incoming")
              : t("partnerManage.outgoing")}
          </Tag>
        );
      },
    },
    {
      title: t("partnerManage.amount"),
      dataIndex: "amount",
      key: "amount",
      width: 140,
      align: "right",
      render: (value: number) => {
        const isIncoming = value > 0;
        return (
          <span
            className="text-sm"
            style={{ color: isIncoming ? "#52c41a" : "#ff4d4f" }}
          >
            {isIncoming ? "+" : ""}
            {formatNumber(Math.abs(value))}
          </span>
        );
      },
    },
    {
      title: t("partnerManage.remainingAmount"),
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 140,
      align: "right",
      render: (value: number | undefined) => {
        if (value === undefined || value === null) return "-";
        return (
          <span className="text-sm text-gray-700">{formatNumber(Math.abs(value))}</span>
        );
      },
    },
    // Chỉ hiển thị cột exchangeRate nếu currencyCode có 'PT' hoặc 'KG'
    ...(!currencyCode.includes("PT")
      ? [
          {
            title: currencyCode.includes("KG")
              ? t("partnerManage.feePerKg")
              : t("partnerManage.exchangeRateLabel"),
            dataIndex: "exchangeRate",
            key: "exchangeRate",
            width: 130,
            align: "right" as const,
            render: (value: number) => (
              <span className="text-sm text-gray-700">{formatNumber(value)}</span>
            ),
          },
        ]
      : []),
    {
      title: t("partnerManage.note"),
      dataIndex: "note",
      key: "note",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (note: string | undefined) =>
        note ? (
          <Tooltip title={note} placement="topLeft">
            <span className="text-gray-600 text-sm cursor-pointer">{note}</span>
          </Tooltip>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
    {
      title: t("partnerManage.date"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      sorter: (a, b) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => (
        <span className="text-sm text-gray-700">
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: t("partnerManage.actions"),
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            setSelectedTransaction(record);
            setDeleteModalVisible(true);
          }}
          size="small"
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 w-full">
        {/* Header with Search and Actions */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-800 m-0">
            {t("partnerManage.partnerListTitle")} - {currencyCode}
          </h3>
          <Space>
            <RangePicker
              value={dateRange as any}
              onChange={(dates) => onDateRangeChange && onDateRangeChange(dates as [any, any])}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              suffixIcon={<CalendarOutlined />}
              allowClear
              size="middle"
            />
            <Input
              placeholder={t("partnerManage.searchPartnerPlaceholder")}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(0);
              }}
              style={{ width: 200 }}
              allowClear
            />
            {onAddTransaction && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddTransaction}
              >
                {t("partnerManage.addTransactionTitle")}
              </Button>
            )}
            {currencyCode && !currencyCode.includes("PT") && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRecalculate}
                loading={recalculateMutation.isPending}
              >
                {t("partnerManage.recalculateFifo")}
              </Button>
            )}
          </Space>
        </div>

        {/* Full Width Table */}
        <div>
          <Table
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            rowKey="id"
            size="small"
            pagination={{
              current: page + 1,
              pageSize: pageSize,
              total: data?.total_items || 0,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} ${t("partnerManage.of")} ${total} ${t("partnerManage.itemsPerPage").split("/")[0]}`,
              onChange: (newPage, newPageSize) => {
                setPage(newPage - 1);
                if (newPageSize) setPageSize(newPageSize);
              },
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            scroll={{ x: 1300 }}
            bordered
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t("partnerManage.deleteMaterialTitle")}
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedTransaction(null);
        }}
        okText={t("partnerManage.saveButton")}
        cancelText={t("partnerManage.cancelButton")}
        confirmLoading={deleteMutation.isPending}
        okButtonProps={{ danger: true }}
      >
        <p>{t("partnerManage.deleteMaterialConfirm")}</p>
        {selectedTransaction && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="mb-2">
              <strong>{t("partnerManage.partner")}:</strong>{" "}
              {selectedTransaction.partnerName}
            </p>
            <p className="mb-2">
              <strong>{t("partnerManage.amount")}:</strong>{" "}
              <span
                style={{
                  color: selectedTransaction.amount > 0 ? "#52c41a" : "#ff4d4f",
                }}
              >
                {selectedTransaction.amount > 0 ? "+" : ""}
                {formatNumber(Math.abs(selectedTransaction.amount))}
              </span>
            </p>
            <p className="mb-0">
              <strong>{t("partnerManage.exchangeRateLabel")}:</strong>{" "}
              {formatNumber(selectedTransaction.exchangeRate)}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};
