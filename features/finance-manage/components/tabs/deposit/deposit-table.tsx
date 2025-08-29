"use client";
import React, { useState } from "react";
import TableComponent, { PaginatedResponse } from "@/components/TableComponent";
import { DepositRecord, getDepositColumns } from "./deposit-columns";
import DepositFilter from "./deposit-filter";
import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

const DepositTable = ({}) => {
  const [page, setPage] = useState(1);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleAction = (type: string, record: DepositRecord) => {
    console.log("Action:", type, record);
  };
  const columns = getDepositColumns(handleAction);

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
        <h2 className="text-lg font-bold mb-4">Duyệt Giao dịch Nạp tiền</h2>
        <Button
          type="primary"
          className="!h-9 !bg-green-500 !hover:bg-green-600 !text-white !font-bold !py-2 !px-4 !rounded-lg !flex !items-center !shadow-sm"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Nạp tiền Thủ công
        </Button>
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

export default DepositTable;
