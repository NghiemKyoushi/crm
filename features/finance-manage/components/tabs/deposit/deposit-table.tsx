"use client";
import React, { useState } from "react";
import TableComponent from "@/components/TableComponent";
import DepositFilter from "./deposit-filter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import ManualDepositModal from "./modal/modal-add-manual";
import { ColumnsType } from "antd/es/table";
import { Tag, Button, Space } from "antd";
import CancelReasonModal from "./modal/modal-cancel-statement";
import PopupConfirm from "@/components/PopupConfirm";
import TransactionHistoryModal from "./modal/modal-history";
import {
  mapDepositResponseToPaginatedResponse,
  useListTopups,
} from "@/features/finance-manage/hooks";
import {
  DepositItem,
  DepositParams,
  DepositRequest,
  TransactionHistory,
} from "@/types/deposit-type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  cancelTopup,
  confirmTopup,
  createMinusTopupManual,
  createTopupManual,
  getDetailHistoryTopups,
} from "@/features/finance-manage/apis";
import dayjs from "dayjs";
import DepositDetailModal from "./modal/modal-detail-deposit";

const DepositTable = ({}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenMinusManual, setIsOpenMinusManual] = useState(false);
  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmAmount, setConfirmAmount] = useState<number | null>(null);
  const [histories, setHistories] = useState<TransactionHistory[]>([]);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DepositItem | null>(
    null
  );

  const queryClient = useQueryClient();

  const [params, setParams] = useState<DepositParams>({
    page: 0,
    size: 10,
  });
  const { data } = useListTopups(params);

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
    mutationFn: ({
      id,
      confirmed_amount,
    }: {
      id: number;
      confirmed_amount: number;
    }) => confirmTopup(id, confirmed_amount),
    onSuccess: () => {
      toast.success(t("deposit.toast.confirmSuccess"));
      queryClient.invalidateQueries({ queryKey: ["listTopup"] });
      setIsOpenConfirm(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const handleConfirm = () => {
    if (selectedId && confirmAmount) {
      confirmMutation.mutate({
        id: selectedId,
        confirmed_amount: confirmAmount,
      });
    }
  };

  const cancelMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      cancelTopup(id, note),
    onSuccess: () => {
      toast.success(t("deposit.toast.cancelSuccess"));
      queryClient.invalidateQueries({ queryKey: ["listTopup"] });
      setIsOpenConfirm(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const handleCancel = (reason: string) => {
    if (selectedId) {
      cancelMutation.mutate({ id: selectedId, note: reason });
    }
  };

  const handlePageChange = (p: number) => {
    setParams((prev) => ({
      ...prev,
      page: p - 1,
    }));
  };

  const handleOpenHistory = async (id: number, code: string) => {
    try {
      const data = await getDetailHistoryTopups(id);
      setHistories(data);
      setTransactionId(code);
      setIsOpenHistory(true);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử:", error);
    }
  };

  const columns: ColumnsType<DepositItem> = [
    {
      title: t("deposit.columns.code"),
      dataIndex: "deposit_code",
      key: "deposit_code",
      render: (code: string, record: DepositItem) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedRecord(record);
            setIsOpenDetail(true);
          }}
        >
          {code}
        </Button>
      ),
    },
    // {
    //   title: t("deposit.columns.user"),
    //   dataIndex: "user_id",
    //   key: "user_id",
    // },
    {
      title: "Tên người dùng",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: t("deposit.columns.amount"),
      dataIndex: "amount_vnd",
      key: "amount_vnd",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: t("deposit.columns.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => {
        if (!value) return "-";
        return dayjs(value).format("DD-MM-YYYY");
      },
    },
    {
      title: t("deposit.columns.handler"),
      dataIndex: "handler",
      key: "handler",
    },
    {
      title: t("deposit.columns.handledAt"),
      dataIndex: "handler_time",
      key: "handler_time",
      render: (value: string) => {
        if (!value) return "-";
        return dayjs(value).format("DD-MM-YYYY");
      },
    },
    {
      title: t("deposit.columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status: DepositItem["status"], record: DepositItem) => {
        if (record.transaction_id !== null) {
          status = "MANUAL";
        }
        switch (status) {
          case "WAITING_CONFIRMATION":
            return (
              <Tag className="!rounded-3xl" color="gold">
                {t("deposit.status.pending")}
              </Tag>
            );
          case "COMPLETED":
            return (
              <Tag className="!rounded-3xl" color="green">
                {t("deposit.status.completed")}
              </Tag>
            );
          case "CANCELED":
            return (
              <Tag className="!rounded-3xl" color="red">
                {t("deposit.status.canceled")}
              </Tag>
            );
          case "FAILED":
            return (
              <Tag className="!rounded-3xl" color="blue">
                thất bại
                {/* {t("deposit.status.manual")} */}
              </Tag>
            );
          case "MANUAL":
            return (
              <Tag className="!rounded-3xl" color="orange">
                Nạp thủ công
              </Tag>
            );
          default:
            return null;
        }
      },
    },
    {
      title: t("deposit.columns.action"),
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "WAITING_CONFIRMATION"  && (
            <>
              <Button
                className="!bg-green-500 !hover:bg-green-600 !text-white !px-2 !py-1 !font-medium !rounded"
                type="primary"
                size="small"
                onClick={() => {
                  setConfirmAmount(record.amount);
                  setSelectedId(record.id);
                  setIsOpenConfirm(true);
                }}
              >
                {t("deposit.actions.confirm")}
              </Button>
              <Button
                className="!bg-red-500 !hover:bg-red-600 !text-white !px-2 !py-1 !font-medium !rounded"
                size="small"
                onClick={() => {
                  setSelectedId(record.id);
                  setIsOpenCancel(true);
                }}
              >
                {t("deposit.actions.cancel")}
              </Button>
            </>
          )}
          {["CANCELED", "COMPLETED", "MANUAL"].includes(record.status) && (
            <div>
              <Button
                type="link"
                size="small"
                onClick={() =>
                  handleOpenHistory(record.id, record.deposit_code)
                }
              >
                {t("deposit.actions.history")}
              </Button>
            </div>
          )}
        </Space>
      ),
    },
  ];

  const createTopupManualMutation = useMutation({
    mutationFn: (data: DepositRequest) => createTopupManual(data),
    onSuccess: () => {
      toast.success("Tạo lệnh nạp tiền thành công!");
      queryClient.invalidateQueries({ queryKey: ["listTopup"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const createMinusTopupManualMutation = useMutation({
    mutationFn: (data: DepositRequest) => createMinusTopupManual(data),
    onSuccess: () => {
      toast.success("Tạo lệnh nạp tiền thành công!");
      queryClient.invalidateQueries({ queryKey: ["listTopup"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const handleCreateTopupManual = (value: DepositRequest) => {
    createTopupManualMutation.mutate(value);
    setIsOpen(false)
  };

  const handleCreateMinusTopupManual = (value: DepositRequest) => {
    createMinusTopupManualMutation.mutate(value);
    setIsOpenMinusManual(false)
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-row justify-between mb-3">
        <h2 className="text-lg font-bold mb-4">Duyệt Giao dịch Nạp tiền</h2>
        <div className="flex flex-row justify-between gap-2">
          <Button
            onClick={() => setIsOpen(true)}
            type="primary"
            className="!h-9 !bg-green-500 !hover:bg-green-600 !text-white !font-bold !py-2 !px-4 !rounded-lg !flex !items-center !shadow-sm"
          >
            <FontAwesomeIcon icon={faPlusCircle} /> Nạp tiền Thủ công
          </Button>
          <Button
            onClick={() => setIsOpenMinusManual(true)}
            type="primary"
            className="!h-9 !bg-red-500 !hover:bg-green-600 !text-white !font-bold !py-2 !px-4 !rounded-lg !flex !items-center !shadow-sm"
          >
            <FontAwesomeIcon icon={faMinusCircle} /> Trừ tiền Thủ công
          </Button>
        </div>
      </div>
      <DepositFilter onFilter={handleSearch} />
      <TableComponent
        columns={columns}
        dataSource={data?.content || []}
        response={
          data
            ? mapDepositResponseToPaginatedResponse<DepositItem>(data)
            : undefined
        }
        page={params.page ? params.page + 1 : 0}
        rowHeight={45}
        onPageChange={handlePageChange}
        fontSize={14}
        headerHeight={44}
      />
      <ManualDepositModal
        onClose={() => setIsOpen(false)}
        open={isOpen}
        onConfirm={handleCreateTopupManual}
        type={"PLUS"}
      />

      <ManualDepositModal
        onClose={() => setIsOpenMinusManual(false)}
        open={isOpenMinusManual}
        onConfirm={handleCreateMinusTopupManual}
        type={"MINUS"}
      />

      <CancelReasonModal
        transactionCode="N-0805-1"
        onClose={() => setIsOpenCancel(false)}
        open={isOpenCancel}
        onConfirm={handleCancel}
      />
      <PopupConfirm
        open={isOpenConfirm}
        type={"confirm"}
        title={t("deposit.modal.confirmTitle")}
        content={t("deposit.modal.confirmContent")}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpenConfirm(false)}
        confirmText={t("deposit.modal.confirmText")}
        cancelText={t("deposit.modal.cancelText")}
      />

      <TransactionHistoryModal
        open={isOpenHistory}
        onClose={() => setIsOpenHistory(false)}
        transactionId={transactionId ?? ""}
        histories={histories}
      />

      <DepositDetailModal
        open={isOpenDetail}
        onClose={() => setIsOpenDetail(false)}
        record={selectedRecord}
      />
    </div>
  );
};

export default DepositTable;
