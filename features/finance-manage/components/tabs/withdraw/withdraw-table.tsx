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
import { confirmWithdraw, getDetailHistoryTopups, getDetailHistoryWithdraw } from "@/features/finance-manage/apis";
import TransactionHistoryModal from "../deposit/modal/modal-history";

const WithdrawTable = ({}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const handlePageChange = (p: number) => {
    setPage(p);
  };
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const [histories, setHistories] = useState<any[]>([]);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [params, setParams] = useState<DepositParams>({
    page: 0,
    size: 10,
  });

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
    mutationFn: (id: number) => confirmWithdraw(id),
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

  const columns: ColumnsType<withdrawItem> = [
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
      dataIndex: "amount",
      key: "amount",
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
      render: (status: withdrawItem["status"]) => {
        switch (status) {
          case "PENDING":
            return (
              <Tag className="!rounded-3xl" color="gold">
                Chờ xử lý
              </Tag>
            );
          case "COMPLETED":
            return (
              <Tag className="!rounded-3xl" color="green">
                Thành công
              </Tag>
            );
          case "REJECTED":
            return (
              <Tag className="!rounded-3xl" color="red">
                Bị từ chối
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
                className="!bg-blue-500 !hover:bg-green-600 !text-white !px-2 !py-1 !font-medium !rounded"
                type="primary"
                size="small"
                onClick={() => {
                  setSelectedId(record.id);
                  setIsOpenConfirm(true);
                }}
              >
                Đã chuyển
              </Button>
              <Button
                className="!bg-gray-500 !hover:bg-red-600 !text-white !px-2 !py-1 !font-medium !rounded"
                size="small"
                // onClick={() => setIsOpenCancel(true)}
              >
                Từ chối
              </Button>
            </>
          )}
          {["CANCELED", "COMPLETED", "MANUAL"].includes(record.status) && (
            <div>
              <Button
                type="link"
                size="small"
                onClick={() => handleOpenHistory(record.id, "TEST_CODE")}
              >
                Xem lịch sử
              </Button>
            </div>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-row justify-between mb-3">
        <h2 className="text-lg font-bold mb-4">Xử lý Giao dịch Rút tiền</h2>
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
        page={page}
        rowHeight={45}
        onPageChange={handlePageChange}
        fontSize={14}
        headerHeight={44}
      />

      <TransactionHistoryModal
        open={isOpenHistory}
        onClose={() => setIsOpenHistory(false)}
        transactionId={transactionId ?? ""}
        histories={histories}
      />
    </div>
  );
};

export default WithdrawTable;
