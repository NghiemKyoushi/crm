"use client";

import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

// Kiểu dữ liệu
interface RowItem {
  date: string;
  customer: string;
  count: number;
  link: string;
  reason: string;
  reasonType?: "danger" | "warning" | "normal";
}

interface Props {
  blockedCount: number;
  bomCount: number;
  rows: RowItem[];
}

export const CustomerViolationTable: React.FC<Props> = ({
  blockedCount,
  bomCount,
  rows,
}) => {

  const columns: ColumnsType<RowItem & { key: string }> = [
    {
      title: <span className="px-4 py-3">NGÀY</span>,
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <span className="text-gray-600">{date}</span>
      ),
      className: 'px-4 py-3'
    },
    {
      title: <span className="px-4 py-3">KHÁCH</span>,
      dataIndex: 'customer',
      key: 'customer',
      render: (_: any, record: RowItem) => (
        <span className="font-medium text-gray-800">
          {record.customer}{" "}
          <span className="text-red-500 text-sm">({record.count}/3)</span>
        </span>
      ),
      className: 'px-4 py-3'
    },
    {
      title: <span className="px-4 py-3">LINK</span>,
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => (
        <span className="text-gray-700">{link}</span>
      ),
      className: 'px-4 py-3'
    },
    {
      title: <span className="px-4 py-3">LÝ DO</span>,
      dataIndex: 'reason',
      key: 'reason',
      render: (_: string, record: RowItem) => (
        <span
          className={
            record.reasonType === "danger"
              ? "px-2 py-1 text-xs rounded bg-red-100 text-red-600"
              : record.reasonType === "warning"
              ? "px-2 py-1 text-xs rounded bg-orange-100 text-orange-600"
              : "px-2 py-1 text-xs rounded bg-gray-100 text-gray-600"
          }
        >
          {record.reason}
        </span>
      ),
      className: 'px-4 py-3'
    },
    {
      title: <span className="px-4 py-3 text-center block">THAO TÁC</span>,
      key: 'actions',
      align: "center",
      render: (_: any, record: RowItem) => (
        <button className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 transition mx-auto">
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      ),
      className: 'px-4 py-3 text-center'
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* --- TOP STATS --- */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* Khách bị khóa */}
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-red-600 font-medium">Khách bị khóa</p>
          <p className="text-3xl font-bold text-red-600">{blockedCount} người</p>
        </div>

        {/* Bom hàng tháng này */}
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
          <p className="text-orange-600 font-medium">Bom hàng tháng này</p>
          <p className="text-3xl font-bold text-orange-600">{bomCount} lượt</p>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <Table
          dataSource={(rows || []).map((item, idx) => ({ ...item, key: String(idx) }))}
          columns={columns}
          pagination={false}
          rowClassName={(_, index) =>
            "border-t border-gray-100 hover:bg-gray-50 transition text-sm"
          }
          showHeader
          size="middle"
          className="w-full !border-none custom-customer-table"
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
};
