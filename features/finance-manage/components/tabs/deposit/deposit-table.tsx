"use client";
import React, { useState } from "react";
import TableComponent from "@/components/TableComponent";
import DepositFilter from "./deposit-filter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import ManualDepositModal from "./modal/modal-add-manual";
import { ColumnsType } from "antd/es/table";
import { Tag, Button, Space, Tooltip } from "antd";
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
import TransactionCompleteModal from "./modal/transaction-topup-complete-modal";
import { usePermission } from "@/components/layout/PermissionContext";
import ManualPartnerModal from "./modal/modal-add-partner-manual";

interface DepositTableProps {
  action?: string;
  code?: string;
}
const DepositTable = (props: DepositTableProps) => {
  const { action, code } = props;
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
  const [selectedCode, setSelectedCode] = useState<string>("");

  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DepositItem | null>(
    null
  );
  const [isOpenCompleteTransaction, setIsOpenCompleteTransaction] =
    useState(false);
  const [typeDetail, setTypeDetail] = useState<string>("TOP_UP");
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();

  const [params, setParams] = useState<DepositParams>({
    page: 0,
    size: 10,
  });
  const { data, isPending } = useListTopups(params);

  const handleSearch = (values: DepositParams) => {
    const newParams: DepositParams = {
      ...params,
      page: 0,
      deposit_code: values.deposit_code || undefined,
      status: values.status || undefined,
      from_date: values.from_date || undefined,
      to_date: values.to_date || undefined,
      handler: values.handler || undefined,
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
      setIsOpenCancel(false);
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
      console.error(t("system.errorGettingHistory"), error);
    }
  };

  const columns: ColumnsType<DepositItem> = [
    {
      title: t("deposit.columns.code"),
      dataIndex: "deposit_code",
      key: "deposit_code",
      width: 130,
      render: (code: string, record: DepositItem) => {
        if (!code) return "";
        const displayCode =
          code.length > 12 ? `${code.slice(0, 8)}...${code.slice(-4)}` : code;
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
      dataIndex: "user_name",
      key: "user_name",
      width: 150,
      render: (text: string, record: DepositItem) => {
        if (!text) return "";
        return (
          <div>
            <Tooltip title={text}>
              <div className="text-sm text-gray-800 truncate max-w-[140px]">
                {text}
              </div>
            </Tooltip>
            <div className="text-xs text-gray-500">ID: {record.customer_code}</div>
          </div>
        );
      },
    },
    {
      title: t("deposit.columns.amount"),
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (value: number) => {
        if (value == null) return null;
        const formatted = value.toLocaleString("vi-VN");
        return (
          <div
            className={`text-sm ${
              value >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {value >= 0 ? "+" : ""}
            {formatted}đ
          </div>
        );
      },
    },
    {
      title: t("deposit.columns.note"),
      dataIndex: "note",
      key: "note",
      width: 200,
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
      title: t("deposit.columns.handler"),
      dataIndex: "handler",
      key: "handler",
      width: 130,
      render: (handler: string, record: DepositItem) => {
        if (!handler) return <span className="text-gray-400 text-sm">-</span>;
        return (
          <div>
            <Tooltip title={handler}>
              <div className="text-sm text-gray-700 truncate max-w-[120px]">
                {handler}
              </div>
            </Tooltip>
            {record.handler_time && (
              <div className="text-xs text-gray-500">
                {dayjs(record.handler_time).format("DD/MM HH:mm")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t("deposit.columns.status"),
      key: "status_action",
      width: 160,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const statusConfig = {
          WAITING_CONFIRMATION: {
            color: "gold",
            text: record.type === "DEBIT" ? t("deposit.status.pendingSettlement") : t("deposit.status.pending"),
          },
          COMPLETED: { color: "green", text: record.type === "DEBIT" ?  t("deposit.status.settled") : t("deposit.status.completed") },
          CANCELED: { color: "red", text: t("deposit.status.canceled") },
          FAILED: { color: "blue", text: t("status.failed") },
          MANUAL_TOP_UP_COMPLETED: { color: "green", text: t("status.topUp") },
          MANUAL_WITHDRAWAL_COMPLETED: {
            color: "red",
            text: t("status.deduction"),
          },
          CANCELED_BY_USER: {
            color: "orange",
            text: t("status.cancelledByUser"),
          },
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
              <Button
                type="link"
                size="small"
                className="!text-xs !p-0 !h-auto"
                onClick={() => {
                  setSelectedId(record.id);
                  let type = "TOP_UP";
                  if (record.status === "MANUAL_TOP_UP_COMPLETED") {
                    type = "MANUAL_TOP_UP";
                  } else if (record.status === "MANUAL_WITHDRAWAL_COMPLETED") {
                    type = "MANUAL_WITHDRAWAL";
                  }
                  setTypeDetail(type);
                  setIsOpenCompleteTransaction(true);
                }}
              >
                Chi tiết
              </Button>
              {record.status === "WAITING_CONFIRMATION" &&
                hasPermission("finance.approve_topup") &&
                hasPermission("finance.approve_topup_requests") && (
                  <>
                    <Button
                      className="!bg-green-500 !text-white !border-0 !text-xs !px-2 !h-6"
                      size="small"
                      onClick={() => {
                        setConfirmAmount(record.amount);
                        setSelectedId(record.id);
                        setIsOpenConfirm(true);
                      }}
                    >
                      Duyệt
                    </Button>
                    <Button
                      className="!bg-red-500 !text-white !border-0 !text-xs !px-2 !h-6"
                      size="small"
                      onClick={() => {
                        setSelectedCode(record.deposit_code);
                        setSelectedId(record.id);
                        setIsOpenCancel(true);
                      }}
                    >
                      Hủy
                    </Button>
                  </>
                )}
              {[
                "CANCELED",
                "COMPLETED",
                "MANUAL_TOP_UP_COMPLETED",
                "MANUAL_WITHDRAWAL_COMPLETED",
              ].includes(record.status) && (
                <Button
                  type="link"
                  size="small"
                  className="!text-xs !p-0 !h-auto"
                  onClick={() =>
                    handleOpenHistory(record.id, record.deposit_code)
                  }
                >
                  Lịch sử
                </Button>
              )}
            </Space>
          </div>
        );
      },
    },
  ];

  const createTopupManualMutation = useMutation({
    mutationFn: (data: DepositRequest) => createTopupManual(data),
    onSuccess: () => {
      toast.success(t("toast.createDepositSuccess"));
      queryClient.invalidateQueries({ queryKey: ["listTopup"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const createMinusTopupManualMutation = useMutation({
    mutationFn: (data: DepositRequest) => createMinusTopupManual(data),
    onSuccess: () => {
      toast.success(t("toast.createDepositSuccess"));
      queryClient.invalidateQueries({ queryKey: ["listTopup"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const handleCreateTopupManual = (value: DepositRequest) => {
    createTopupManualMutation.mutate(value);
    setIsOpen(false);
  };

  const handleCreateMinusTopupManual = (value: DepositRequest) => {
    createMinusTopupManualMutation.mutate(value);
    setIsOpenMinusManual(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          {t("deposit.approveDeposit")}
        </h2>
        <div className="flex items-center gap-3">
        {/* {hasPermission("finance.manual_topup") && (
            <>
              <Button
                onClick={() => setIsOpen(true)}
                type="primary"
                className="!h-9 !bg-blue-500 hover:!bg-blue-600 !border-blue-500 hover:!border-blue-600 !text-white !font-normal !px-4 !rounded-md !flex !items-center !gap-2 !shadow-sm transition-all"
              >
                <FontAwesomeIcon icon={faPlusCircle} className="text-sm" />
                <span>Nạp tiền cho đối tác</span>
              </Button>
            </>
          )} */}
          {hasPermission("finance.manual_topup") && (
            <>
              <Button
                onClick={() => setIsOpen(true)}
                type="primary"
                className="!h-9 !bg-green-500 hover:!bg-green-600 !border-green-500 hover:!border-green-600 !text-white !font-normal !px-4 !rounded-md !flex !items-center !gap-2 !shadow-sm transition-all"
              >
                <FontAwesomeIcon icon={faPlusCircle} className="text-sm" />
                <span>{t("deposit.manualDeposit")}</span>
              </Button>
            </>
          )}
          
          {hasPermission("finance.finance.manual_withdrawal") && (
            <Button
              onClick={() => setIsOpenMinusManual(true)}
              type="primary"
              className="!h-9 !bg-red-500 hover:!bg-red-600 !border-red-500 hover:!border-red-600 !text-white !font-normal !px-4 !rounded-md !flex !items-center !gap-2 !shadow-sm transition-all"
            >
              <FontAwesomeIcon icon={faMinusCircle} className="text-sm" />
              <span>{t("deposit.manualWithdraw")}</span>
            </Button>
          )}
        </div>
      </div>
      <DepositFilter onFilter={handleSearch} code={code} action={action} />
      <div className="overflow-x-auto">
        <TableComponent
          columns={columns}
          dataSource={data?.content || []}
          response={
            data
              ? mapDepositResponseToPaginatedResponse<DepositItem>(data)
              : undefined
          }
          page={params.page ? params.page + 1 : 0}
          rowHeight={60}
          onPageChange={handlePageChange}
          fontSize={13}
          headerHeight={46}
          loading={isPending}
        />
      </div>
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
        transactionCode={selectedCode}
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
        isDeposit={true}
      />

      <DepositDetailModal
        open={isOpenDetail}
        onClose={() => setIsOpenDetail(false)}
        record={selectedRecord}
      />

      <TransactionCompleteModal
        onCancel={() => setIsOpenCompleteTransaction(false)}
        open={isOpenCompleteTransaction}
        selectId={selectedId}
        typeDetail={typeDetail}
      />
      {/* <ManualPartnerModal
       onClose={() => console.log('') }
       onConfirm={(value) => console.log('value', value)}
       open={true}
      /> */}
    </div>
  );  
};

export default DepositTable;
