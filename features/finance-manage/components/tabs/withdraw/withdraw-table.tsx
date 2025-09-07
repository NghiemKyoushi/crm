"use client";
import React, { useState } from "react";
import TableComponent from "@/components/TableComponent";
import DepositFilter from "./withdraw-filter";
import { Button, Space, Tag } from "antd";
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
  getDetailHistoryTopups,
  getDetailHistoryWithdraw,
} from "@/features/finance-manage/apis";
import TransactionHistoryModal from "../deposit/modal/modal-history";
import CancelReasonModal from "../deposit/modal/modal-cancel-statement";
import ConfirmReasonModal from "../deposit/modal/modal-complete-statement";
import TransactionDetailModal from "./modal/transaction-detail-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faQrcode } from "@fortawesome/free-solid-svg-icons";
import TransactionCompleteModal from "./modal/transaction-complete-modal";

const WithdrawTable = ({}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [selectedId, setSelectedId] = useState<number | null>(null);
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
    const newParams: DepositParams = {
      ...params,
      depositCode: values.depositCode,
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
      setIsOpenTransaction(false)
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
      setIsOpenTransaction(false)
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
      setIsOpenTransaction(false)
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
    },
    {
      title: t("withdraw.customer"),
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: t("withdraw.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: t("withdraw.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => {
        if (!value) return "-";
        return dayjs(value).format("DD-MM-YYYY");
      },
    },
    {
      title: t("withdraw.handler"),
      dataIndex: "handler",
      key: "handler",
    },
    {
      title: t("withdraw.handledAt"),
      dataIndex: "handledAt",
      key: "handledAt",
    },

    {
      title: t("withdraw.status"),
      dataIndex: "status",
      key: "status",
      render: (status: withdrawItem["status"]) => {
        switch (status) {
          case "PENDING":
            return (
              <Tag className="!rounded-3xl" color="gold">
                {t("withdraw.statusType.pending")}
              </Tag>
            );
          case "APPROVED":
            return (
              <Tag className="!rounded-3xl" color="green">
               {t("withdraw.statusType.approved")}
              </Tag>
            );
          case "COMPLETED":
            return (
              <Tag className="!rounded-3xl" color="green">
                {t("withdraw.statusType.completed")}
              </Tag>
            );
          case "CANCELLED":
            return (
              <Tag className="!rounded-3xl" color="red">
               {t("withdraw.statusType.cancelled")}
              </Tag>
            );
          case "REJECTED":
            return (
              <Tag className="!rounded-3xl" color="red">
                {t("withdraw.statusType.rejected")}
              </Tag>
            );

          default:
            return null;
        }
      },
    },
    {
      title: t("withdraw.qrCode"),
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => (
        <Space>
          {["PENDING", "APPROVED"].includes(record.status) && (
            <button
              className="cursor-pointer"
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
              <FontAwesomeIcon
                icon={faQrcode}
                className="text-blue-500 text-xl"
              />
            </button>
          )}

          {["CANCELLED", "COMPLETED", "REJECTED"].includes(record.status) && (
            <button
              className="cursor-pointer"
              onClick={() => {
                setSelectedId(record.id);
                setIsOpenCompleteTransaction(true);
              }}
            >
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-blue-500 text-xl"
              />
            </button>
          )}
        </Space>
      ),
    },
    {
      title: t("common.actions"),
      key: "action",
      render: (_, record) => (
        <Space>
          <div>
            <Button
              size="small"
              onClick={() => handleOpenHistory(record.id, record.deposit_code)}
              className="!bg-indigo-500 !hover:bg-green-600 !text-white !px-2 !py-1 !font-medium !rounded"
            >
              {t("withdraw.history")}
            </Button>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-row justify-between mb-3">
        <h2 className="text-lg font-bold mb-4">{t("withdraw.title")}</h2>
      </div>
      <DepositFilter onFilter={handleSearch} />

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
      <TableComponent
        columns={columns}
        dataSource={data?.data || []}
        response={data}
        page={params.page ? params.page + 1 : 0}
        rowHeight={45}
        onPageChange={handlePageChange}
        fontSize={14}
        headerHeight={44}
      />

      <CancelReasonModal
        transactionCode="N-0805-1"
        onClose={() => setIsOpenCancel(false)}
        open={isOpenCancel}
        onConfirm={handleCancel}
      />

      <ConfirmReasonModal
        transactionCode="N-0805-1"
        onClose={() => setIsOpenComplete(false)}
        open={isOpenComplete}
        onConfirm={handleComplete}
      />

      <TransactionHistoryModal
        open={isOpenHistory}
        onClose={() => setIsOpenHistory(false)}
        transactionId={transactionId ?? ""}
        histories={histories}
      />
      <TransactionDetailModal
        open={isOpenTransaction}
        onCancel={() => setIsOpenTransaction(false)}
        selectId={selectedId}
        onConfirm={() => {
          setIsOpenConfirm(true);
        }}
        onReject={() => {
          setIsOpenCancel(true)
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
