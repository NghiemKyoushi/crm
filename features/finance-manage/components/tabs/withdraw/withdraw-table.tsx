"use client";
import React, { useState } from "react";
import TableComponent, { PaginatedResponse } from "@/components/TableComponent";
import { DepositRecord, getWithdrawColumns } from "./withdraw-columns";
import DepositFilter from "./withdraw-filter";
import { Button, Space, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import ManualDepositModal from "../deposit/modal/modal-add-manual";
import { ColumnsType } from "antd/es/table";
import { withdrawItem } from "@/types/deposit-type";
import dayjs from "dayjs";

const WithdrawTable = ({}) => {
  const [page, setPage] = useState(1);
  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleAction = (type: string, record: DepositRecord) => {
    console.log("Action:", type, record);
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
                className="!bg-green-500 !hover:bg-green-600 !text-white !px-2 !py-1 !font-medium !rounded"
                type="primary"
                size="small"
                onClick={() => {
                  // setSelectedId(record.id);
                  // setIsOpenConfirm(true);
                }}
              >
                Xác nhận
              </Button>
              <Button
                className="!bg-red-500 !hover:bg-red-600 !text-white !px-2 !py-1 !font-medium !rounded"
                size="small"
                // onClick={() => setIsOpenCancel(true)}
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
                // onClick={() => setIsOpenHistory(true)}
              >
                Xem lịch sử
              </Button>
            </div>
          )}
        </Space>
      ),
    },
  ];

  const mockResponse: PaginatedResponse<DepositRecord> = {
    data: [
      {
        id: "1",
        orderCode: "N-0805-1",
        customer: "Nguyễn Văn A (KH001)",
        amount: 5000000,
        createdAt: "05/08/2025 14:15",
        handler: "-",
        handledAt: "",
        status: "pending",
      },
      {
        id: "2",
        orderCode: "N-0805-2",
        customer: "Trần Thị B (KH002)",
        amount: 10000000,
        createdAt: "05/08/2025 11:30",
        handler: "Admin",
        handledAt: "05/08/2025 11:35",
        status: "confirmed",
      },
    ],
    total_items: 2,
    page_size: 10,
    total_pages: 1,
    current_page: 1,
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-row justify-between mb-3">
        <h2 className="text-lg font-bold mb-4">Xử lý Giao dịch Rút tiền</h2>
      </div>
      <DepositFilter onFilter={(f: any) => console.log("Filter", f)} />
      <TableComponent<DepositRecord>
        columns={columns}
        dataSource={mockResponse.data}
        response={mockResponse}
        page={page}
        rowHeight={45}
        onPageChange={handlePageChange}
        fontSize={14}
        headerHeight={44}
      />
    </div>
  );
};

export default WithdrawTable;
