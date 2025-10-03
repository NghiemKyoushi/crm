"use client";
import React, { useState } from "react";
import TableComponent from "@/components/TableComponent";
import DepositFilter from "./withdraw-filter";
import { Button, Space, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { DepositParams, withdrawItem } from "@/types/deposit-type";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useListWithdraw } from "@/features/finance-manage/hooks";
import PopupConfirm from "@/components/PopupConfirm";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelWithdraw,
  completeWithdraw,
  confirmWithdraw,
  getDetailHistoryWithdraw,
} from "@/features/finance-manage/apis";
import TransactionHistoryModal from "../deposit/modal/modal-history";
import CancelReasonModal from "../deposit/modal/modal-cancel-statement";
import ConfirmReasonModal from "../deposit/modal/modal-complete-statement";
import TransactionDetailModal from "./modal/transaction-detail-modal";
import TransactionCompleteModal from "./modal/transaction-complete-modal";
import { useSearchParams } from "next/navigation";

const WithdrawTable = ({}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const code = searchParams.get("code");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>("");

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const [histories, setHistories] = useState<any[]>([]);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [isOpenComplete, setIsOpenComplete] = useState(false);
  const [isOpenTransaction, setIsOpenTransaction] = useState(false);
  const [isOpenCompleteTransaction, setIsOpenCompleteTransaction] =
    useState(false);

  const [isTransacted, setIsTransacted] = useState(false);

  const [params, setParams] = useState<DepositParams>({
    page: 0,
    size: 10,
  });

  const handlePageChange = (p: number) => {
    setParams((prev) => ({
      ...prev,
      page: p - 1,
    }));
  };

  const { data } = useListWithdraw(params);
  const handleSearch = (values: DepositParams) => {
    const newParams: any = {
      ...params,
      code: values.depositCode,
      status: values.status,
      fromDate: values.fromDate,
      toDate: values.toDate,
      page: 0,
    };
    setParams(newParams);
  };

  const confirmMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      confirmWithdraw(id, note),
    onSuccess: () => {
      toast.success(t("withdraw.confirmSuccess"));
      queryClient.invalidateQueries({ queryKey: ["listwithdraw"] });
      setIsOpenConfirm(false);
      setIsOpenTransaction(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { note: string } }) =>
      completeWithdraw(id, body),
    onSuccess: () => {
      toast.success(t("withdraw.completeSuccess"));
      queryClient.invalidateQueries({ queryKey: ["listwithdraw"] });
      setIsOpenConfirm(false);
      setIsOpenTransaction(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      cancelWithdraw(id, note),
    onSuccess: () => {
      toast.success(t("withdraw.cancelSuccess"));
      queryClient.invalidateQueries({ queryKey: ["listwithdraw"] });
      setIsOpenConfirm(false);
      setIsOpenTransaction(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const handleConfirm = () => {
    if (selectedId) {
      confirmMutation.mutate({ id: selectedId, note: "" });
      setIsOpenConfirm(false);
    }
  };

  const handleOpenHistory = async (id: number, code: string) => {
    try {
      const data = await getDetailHistoryWithdraw(id);
      setHistories(data);
      setTransactionId(code);
      setIsOpenHistory(true);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử:", error);
    }
  };

  const handleCancel = (reason: string) => {
    if (selectedId) {
      cancelMutation.mutate({ id: selectedId, note: reason });
      setIsOpenCancel(false);
      setIsOpenTransaction(false);
    }
  };

  const handleComplete = (reason: string) => {
    if (selectedId) {
      completeMutation.mutate({
        id: selectedId,
        body: { note: reason },
      });
      setIsOpenComplete(false);
      setIsOpenHistory(false);
    }
  };

  const columns: ColumnsType<withdrawItem> = [
    {
      title: t("withdraw.code"),
      dataIndex: "deposit_code",
      key: "deposit_code",
      width: 130,
      render: (code: string, record: withdrawItem) => {
        if (!code) return "";
        const displayCode = code.length > 12 ? `${code.slice(0, 8)}...${code.slice(-4)}` : code;
        return (
          <div>
            <Tooltip title={code}>
              <span className="text-blue-600 text-sm">{displayCode}</span>
            </Tooltip>
            <div className="text-xs text-gray-500">
              {dayjs(record.created_at).format("DD/MM HH:mm")}
            </div>
          </div>
        );
      },
    },
    {
      title: t("deposit.columns.userName"),
      dataIndex: "username",
      key: "username",
      width: 150,
      render: (text: string, record: withdrawItem) => {
        if (!text) return "";
        return (
          <div>
            <Tooltip title={text}>
              <div className="text-sm text-gray-800 truncate max-w-[140px]">{text}</div>
            </Tooltip>
            <div className="text-xs text-gray-500">ID: {record.user_id}</div>
          </div>
        );
      },
    },
    {
      title: t("withdraw.amount"),
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (value: number) => {
        const formatted = value.toLocaleString("vi-VN");
        return <div className="text-sm text-red-600">-{formatted}đ</div>;
      },
    },
    {
      title: t("withdraw.note"),
      dataIndex: "note",
      key: "note",
      width: 180,
      render: (note: string) => {
        if (!note) return <span className="text-gray-400 text-sm">-</span>;
        return (
          <Tooltip title={note}>
            <div className="text-sm text-gray-700 line-clamp-2">{note}</div>
          </Tooltip>
        );
      },
    },
    {
      title: t("withdraw.adminNote"),
      dataIndex: "admin_note",
      key: "admin_note",
      width: 180,
      render: (admin_note: string) => {
        if (!admin_note) return <span className="text-gray-400 text-sm">-</span>;
        return (
          <Tooltip title={admin_note}>
            <div className="text-sm text-gray-700 line-clamp-2">{admin_note}</div>
          </Tooltip>
        );
      },
    },
    {
      title: t("withdraw.handler"),
      dataIndex: "processed_name",
      key: "processed_name",
      width: 130,
      render: (processed_name: string, record: withdrawItem) => {
        if (!processed_name) return <span className="text-gray-400 text-sm">-</span>;
        return (
          <div>
            <Tooltip title={processed_name}>
              <div className="text-sm text-gray-700 truncate max-w-[120px]">{processed_name}</div>
            </Tooltip>
            {record.processed_at && (
              <div className="text-xs text-gray-500">
                {dayjs(record.processed_at).format("DD/MM HH:mm")}
              </div>
            )}
          </div>
        );
      },
    },

    {
      title: t("withdraw.status"),
      key: "status_action",
      width: 160,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const statusConfig = {
          PENDING: { color: "gold", text: t("withdraw.statusType.pending") },
          APPROVED: { color: "green", text: t("withdraw.statusType.approved") },
          COMPLETED: { color: "green", text: t("withdraw.statusType.completed") },
          CANCELLED: { color: "red", text: t("withdraw.statusType.cancelled") },
          REJECTED: { color: "red", text: t("withdraw.statusType.rejected") },
        };
        const config = statusConfig[record.status as keyof typeof statusConfig];

        return (
          <div className="flex flex-col items-center gap-2 py-1">
            {config && (
              <Tag className="!rounded-3xl !text-xs !m-0" color={config.color}>
                {config.text}
              </Tag>
            )}
            <Space size="small" className="flex justify-center">
              {["PENDING", "APPROVED"].includes(record.status) && (
                <Button
                  type="link"
                  size="small"
                  className="!text-xs !p-0 !h-auto"
                  onClick={() => {
                    if (record.status === "APPROVED") {
                      setIsTransacted(true);
                    } else {
                      setIsTransacted(false);
                    }
                    setSelectedId(record.id);
                    setIsOpenTransaction(true);
                  }}
                >
                  Xử lý
                </Button>
              )}

              {["CANCELLED", "COMPLETED", "REJECTED"].includes(record.status) && (
                <Button
                  type="link"
                  size="small"
                  className="!text-xs !p-0 !h-auto"
                  onClick={() => {
                    setSelectedCode(record.deposit_code)
                    setSelectedId(record.id);
                    setIsOpenCompleteTransaction(true);
                  }}
                >
                  Chi tiết
                </Button>
              )}

              <Button
                type="link"
                size="small"
                className="!text-xs !p-0 !h-auto"
                onClick={() => handleOpenHistory(record.id, record.deposit_code)}
              >
                Lịch sử
              </Button>
            </Space>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">{t("withdraw.title")}</h2>
      </div>
      <DepositFilter onFilter={handleSearch} action={action ?? undefined} code={code ?? undefined}  />

      <PopupConfirm
        open={isOpenConfirm}
        type={"confirm"}
        title={"Xác nhận rút tiền khách hàng"}
        content={`Bạn có chắc chắn xác nhận rút tiền khách hàng?`}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpenConfirm(false)}
        confirmText={"Xác nhận"}
        cancelText="Huỷ"
      />
      <div className="overflow-x-auto">
        <TableComponent
          columns={columns}
          dataSource={data?.data || []}
          response={data}
          page={params.page ? params.page + 1 : 0}
          rowHeight={60}
          onPageChange={handlePageChange}
          fontSize={13}
          headerHeight={46}
        />
      </div>

      <CancelReasonModal
        transactionCode={selectedCode}
        onClose={() => setIsOpenCancel(false)}
        open={isOpenCancel}
        onConfirm={handleCancel}
      />

      <ConfirmReasonModal
        transactionCode={selectedCode}
        onClose={() => setIsOpenComplete(false)}
        open={isOpenComplete}
        onConfirm={handleComplete}
      />

      <TransactionHistoryModal
        open={isOpenHistory}
        onClose={() => setIsOpenHistory(false)}
        transactionId={transactionId ?? ""}
        histories={histories}
        isDeposit={false}
      />
      <TransactionDetailModal
        open={isOpenTransaction}
        onCancel={() => setIsOpenTransaction(false)}
        selectId={selectedId}
        onConfirm={() => {
          setIsOpenConfirm(true);
        }}
        onReject={() => {
          setIsOpenCancel(true);
        }}
        onComplete={() => {
          setIsOpenComplete(true);
        }}
        isTransacted={isTransacted}
      />
      <TransactionCompleteModal
        onCancel={() => setIsOpenCompleteTransaction(false)}
        open={isOpenCompleteTransaction}
        selectId={selectedId}
      />
    </div>
  );
};

export default WithdrawTable;
