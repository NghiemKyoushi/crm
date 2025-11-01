import { Modal } from "antd";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHistoryDebt } from "@/features/finance-manage/apis";
import type { BankDepositRequest } from "@/types/deposit-type";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import TableComponent from "@/components/TableComponent";
export interface DebtHistoryRecord {
  amount_vnd: number;
  status: "PENDING" | "COMPLETE" | "CANCELED" | string;
  action_by: string;
  action_at: string;
  deposit_code: string;
  id?: string | number;
}
export const DebtDetailModal = ({
  visible,
  onClose,
  record,
}: {
  visible: boolean;
  onClose: () => void;
  record: any;
}) => {
  const [params, setParams] = useState<BankDepositRequest>({
    page: 0,
    size: 10,
  });
  const {
    data: histories,
    isPending,
    refetch,
  } = useQuery({
    enabled: !!record.user_id && visible,
    queryKey: ["debt-history", record.user_id, params],
    queryFn: () => getHistoryDebt(record.user_id, params),
  });

  useEffect(() => {
    if (visible && !!record.user_id) {
      refetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record.user_id]);
  const columns: ColumnsType<DebtHistoryRecord> = [
    {
      title: "Mã giao dịch",
      dataIndex: "deposit_code",
      key: "deposit_code",
      width: 170,
      ellipsis: true,
    },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "amount_vnd",
      key: "amount_vnd",
      align: "right",
      width: 140,
      render: (amount_vnd: number) =>
        amount_vnd?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => {
        let color = "";
        let txt = "";
        switch (status) {
          case "PENDING":
            color = "text-yellow-600 bg-yellow-50 border border-yellow-200";
            txt = "Chờ xác nhận";
            break;
          case "COMPLETED":
            color = "text-green-700 bg-green-50 border border-green-200";
            txt = "Hoàn thành";
            break;
          case "CANCELED":
            color = "text-gray-500 bg-gray-100 border border-gray-200";
            txt = "Đã từ chối";
            break;
          default:
            color = "";
            txt = status;
        }
        return (
          <span
            className={`rounded px-2 py-[2px] text-xs font-medium ${color}`}
          >
            {txt}
          </span>
        );
      },
    },
    {
      title: "Thao tác bởi",
      dataIndex: "action_by",
      key: "action_by",
      width: 170,
      ellipsis: true,
    },
    {
      title: "Thời gian thao tác",
      dataIndex: "action_at",
      key: "action_at",
      width: 170,
      render: (action_at: string) =>
        action_at ? dayjs(action_at).format("DD-MM-YYYY HH:mm:ss") : "",
    },
  ];

  const handlePageChange = (p: number) => {
    setParams((prev) => ({
      ...prev,
      page: p - 1,
    }));
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <span>
            Lịch sử giao dịch công nợ:{" "}
            <span className="text-base font-semibold">
              {Array.isArray(record)
                ? record.map((r: any) => r?.name).join(", ")
                : record?.name}
            </span>
          </span>
          <div className="flex-1"></div>
        </div>
      }
      style={{
        maxHeight: "99vh",
        overflowY: "auto",
        paddingTop: 10,
      }}
      centered
      destroyOnClose
    >
      <div
        style={{
          height: "87vh",
          overflowY: "auto",
          paddingTop: 10,
        }}
      >
        <TableComponent
          columns={columns}
          dataSource={histories?.data || []}
          response={histories}
          page={params.page ? params.page + 1 : 0}
          rowHeight={60}
          onPageChange={handlePageChange}
          fontSize={13}
          loading={isPending}
        />
      </div>
    </Modal>
  );
};
