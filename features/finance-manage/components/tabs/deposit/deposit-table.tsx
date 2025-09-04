"use client";
import React, { useState } from "react";
import TableComponent from "@/components/TableComponent";
import DepositFilter from "./deposit-filter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
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
} from "@/types/deposit-type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  confirmTopup,
  createTopupManual,
} from "@/features/finance-manage/apis";
import dayjs from "dayjs";

const DepositTable = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { t } = useTranslation();
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
    mutationFn: (id: number) => confirmTopup(id),
    onSuccess: () => {
      toast.success("Xác nhận thành công!");
      queryClient.invalidateQueries({ queryKey: ["listTopup"] }); // refresh list
      setIsOpenConfirm(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const handleConfirm = () => {
    if (selectedId) {
      confirmMutation.mutate(selectedId);
    }
  };

  const handlePageChange = (p: number) => {
    setParams((prev) => ({
      ...prev,
      page: p - 1,
    }));
  };

  const columns: ColumnsType<DepositItem> = [
    {
      title: "Mã Lệnh",
      dataIndex: "deposit_code",
      key: "deposit_code",
    },
    {
      title: "Khách hàng (UserID)",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "Số tiền (VND)",
      dataIndex: "amount_vnd",
      key: "amount_vnd",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => {
        if (!value) return "-";
        return dayjs(value).format("DD-MM-YYYY");
      },
    },
    {
      title: "Người xử lý",
      dataIndex: "handler",
      key: "handler",
    },
    {
      title: "Ngày xử lý",
      dataIndex: "handledAt",
      key: "handledAt",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: DepositItem["status"]) => {
        switch (status) {
          case "PENDING":
            return (
              <Tag className="!rounded-3xl" color="gold">
                Chờ xác nhận
              </Tag>
            );
          case "COMPLETED":
            return (
              <Tag className="!rounded-3xl" color="green">
                Đã xác nhận
              </Tag>
            );
          case "CANCELED":
            return (
              <Tag className="!rounded-3xl" color="red">
                Đã hủy
              </Tag>
            );
          case "MANUAL":
            return (
              <Tag className="!rounded-3xl" color="blue">
                Nạp tay
              </Tag>
            );
          default:
            return null;
        }
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "PENDING" && (
            <>
              <Button
                className="!bg-green-500 !hover:bg-green-600 !text-white !px-2 !py-1 !font-medium !rounded"
                type="primary"
                size="small"
                onClick={() => {
                  setSelectedId(record.id);
                  setIsOpenConfirm(true);
                }}
              >
                Xác nhận
              </Button>
              <Button
                className="!bg-red-500 !hover:bg-red-600 !text-white !px-2 !py-1 !font-medium !rounded"
                size="small"
                onClick={() => setIsOpenCancel(true)}
              >
                Hủy Lệnh
              </Button>
            </>
          )}
          {["CANCELED", "COMPLETED", "MANUAL"].includes(record.status) && (
            <div>
              <Button
                type="link"
                size="small"
                onClick={() => setIsOpenHistory(true)}
              >
                Xem lịch sử
              </Button>
            </div>
          )}
        </Space>
      ),
    },
  ];

  const queryClient = useQueryClient();

  const createTopupManualMutation = useMutation({
    mutationFn: (data: DepositRequest) => createTopupManual(data),
    onSuccess: () => {
      toast.success("Tạo lệnh nạp tiền thành công!");
      queryClient.invalidateQueries({ queryKey: ["listTopup"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const handleCreateTopupManual = (value: DepositRequest) => {
    createTopupManualMutation.mutate(value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-row justify-between mb-3">
        <h2 className="text-lg font-bold mb-4">Duyệt Giao dịch Nạp tiền</h2>
        <Button
          onClick={() => setIsOpen(true)}
          type="primary"
          className="!h-9 !bg-green-500 !hover:bg-green-600 !text-white !font-bold !py-2 !px-4 !rounded-lg !flex !items-center !shadow-sm"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Nạp tiền Thủ công
        </Button>
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
      />
      <CancelReasonModal
        transactionCode="N-0805-1"
        onClose={() => setIsOpenCancel(false)}
        open={isOpenCancel}
        onConfirm={() => console.log("checkkk")}
      />
      <PopupConfirm
        open={isOpenConfirm}
        type={"confirm"}
        title={"Xác nhận nạp tiền khách hàng"}
        content={`Bạn có chắc chắn xác nhận nạp tiền khách hàng?`}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpenConfirm(false)}
        confirmText={"Xác nhận"}
        cancelText="Huỷ"
      />
      <TransactionHistoryModal
        open={isOpenHistory}
        onClose={() => setIsOpenHistory(false)}
        transactionId="N-0805-2"
        histories={[
          {
            action: "Xác nhận",
            time: "2025-08-05 11:35:12",
            user: "Admin",
            note: "Giao dịch hợp lệ.",
          },
          {
            action: "Tạo lệnh",
            time: "2025-08-05 11:30:00",
            user: "Trần Thị B (KH)",
          },
        ]}
      />
    </div>
  );
};

export default DepositTable;
