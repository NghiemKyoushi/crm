"use client";
import React, { useState } from "react";
import TableComponent, { PaginatedResponse } from "@/components/TableComponent";
import DepositFilter from "./deposit-filter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import ManualDepositModal from "./modal/modal-add-manual";
import { ColumnsType } from "antd/es/table";
import { Tag, Button, Space } from "antd";
import CancelReasonModal from "./modal/modal-cancel-statement";
import PopupConfirm from "@/components/PopupConfirm";
import TransactionHistoryModal from "./modal/modal-history";
import { useListTopups } from "@/features/finance-manage/hooks";
import { DepositItem, DepositRequest } from "@/types/deposit-type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { createTopupManual } from "@/features/finance-manage/apis";

// export interface DepositRecord {
//   id: string;
//   orderCode: string;
//   customer: string;
//   amount: number;
//   createdAt: string;
//   handler: string;
//   handledAt?: string;
//   status: "pending" | "confirmed" | "canceled" | "manual";
// }

const DepositTable = ({}) => {
  const [page, setPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const { t } = useTranslation();

  const {data} = useListTopups({
    page,
    size: 10,
  });
  
  const handlePageChange = (p: number) => {
    setPage(p);
  };


  const columns: ColumnsType<DepositItem> = [
    {
      title: "Mã Lệnh",
      dataIndex: "orderCode",
      key: "orderCode",
    },
    {
      title: "Khách hàng (UserID)",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Số tiền (VND)",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
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
          case "pending":
            return (
              <Tag className="!rounded-3xl" color="gold">
                Chờ xác nhận
              </Tag>
            );
          case "confirmed":
            return (
              <Tag className="!rounded-3xl" color="green">
                Đã xác nhận
              </Tag>
            );
          case "canceled":
            return (
              <Tag className="!rounded-3xl" color="red">
                Đã hủy
              </Tag>
            );
          case "manual":
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
          {record.status === "pending" && (
            <>
              <Button
                className="!bg-green-500 !hover:bg-green-600 !text-white !px-2 !py-1 !font-medium !rounded"
                type="primary"
                size="small"
                onClick={() => setIsOpenConfirm(true)}
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
          {["confirmed", "canceled", "manual"].includes(record.status) && (
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

  const handleCreateTopupManual = (value: DepositRequest ) =>{
    createTopupManualMutation.mutate(value)
  }

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
      <DepositFilter onFilter={(f: any) => console.log("Filter", f)} />
      <TableComponent
        columns={columns}
        dataSource={data?.content || []}
        response={data?.pageable as unknown as PaginatedResponse<any>}
        page={page}
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
        onConfirm={() => console.log("check")}
        onCancel={() => setIsOpenConfirm(false)}
        confirmText={"Xoá"}
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
