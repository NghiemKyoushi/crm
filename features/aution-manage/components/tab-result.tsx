import React, { useState } from "react";
import { Table, Button, Pagination } from "antd";
import { StatusTag } from "./status-tag";

// Data
const data = [
  { product: "Omega Seamaster", code: "o11223344", customer: "Phạm Văn D", price: "¥32,000", status: "Thắng", slotStatus: "-" },
  { product: "Sony A7R V Body", code: "s22334455", customer: "Lê Văn C", price: "¥285,000", status: "Đã lên đơn", slotStatus: "-" },
  { product: "Canon EOS R5", code: "c55667788", customer: "Hoàng Văn E", price: "¥320,000", status: "Đã thanh toán", slotStatus: "-" },
  { product: "MacBook Pro M3", code: "m33445566", customer: "Trần Thị B", price: "¥180,000", status: "Hủy đơn", slotStatus: "Đã hoàn" },
  { product: "Rolex Submariner", code: "r77889900", customer: "Kiều Văn G", price: "¥800,000", status: "Thua", slotStatus: "Đã hoàn" },
  { product: "iPhone 15 Pro Max", code: "i99887766", customer: "Phạm Văn D", price: "¥125,000", status: "Bom", reason: "Khách đổi ý", slotStatus: "Đã hoàn" },
];

const colorStatus = (s: string) => {
  if (s.includes("Thắng") || s.includes("Đã thanh toán")) return "success";
  if (s.includes("Đã lên đơn")) return "info";
  if (s.includes("Hủy")) return "warning";
  if (s.includes("Thua") || s.includes("Bom")) return "error";
  return "info";
};

export const TabResult = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalResults = 23; // giả định

  const startIndex = (currentPage - 1) * pageSize;
  const actualEndIndex = Math.min(startIndex + pageSize, totalResults);

  const columns = [
    {
      title: "LINK / SẢN PHẨM",
      dataIndex: "product",
      key: "product",
      width: "20%",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium text-gray-900">{record.product}</div>
          <div className="text-blue-600 text-xs">{record.code}</div>
        </div>
      ),
    },
    {
      title: "KHÁCH",
      dataIndex: "customer",
      key: "customer",
      width: "15%",
      render: (txt: string) => <span className="text-gray-700">{txt}</span>,
    },
    {
      title: "GIÁ THẮNG",
      dataIndex: "price",
      key: "price",
      width: "15%",
      render: (txt: string) => <span className="text-green-600 font-semibold">{txt}</span>,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (_: string, record: any) => (
        <StatusTag
          text={record.status + (record.reason ? ` · ${record.reason}` : '')}
          type={colorStatus(record.status)}
        />
      ),
    },
    {
      title: "SLOT",
      dataIndex: "slotStatus",
      key: "slotStatus",
      width: "15%",
      render: (slotStatus: string) =>
        slotStatus === "Đã hoàn" ? (
          <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs font-medium border border-green-200">
            {slotStatus}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      width: "22%",
      render: (_: any, record: any) => (
        <div className="flex gap-1">
          {record.status.includes("Thắng") && (
            <>
              <Button type="primary" size="small" className="h-7 px-3 font-medium rounded-lg">Tạo đơn</Button>
              <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Hủy đơn</Button>
              <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Bom</Button>
            </>
          )}
          {record.status.includes("Đã lên đơn") && (
            <>
              <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Hủy đơn</Button>
              <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Bom</Button>
            </>
          )}
          {record.status.includes("Đã thanh toán") && (
            <Button size="small" className="h-7 px-3 font-medium rounded-lg">Xem đơn</Button>
          )}
          {(record.status.includes("Hủy") || record.status.includes("Thua") || record.status.includes("Bom")) && (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
  ];

  // Row class for highlight
  const rowClassName = (_: any, idx: number) => {
    const r = data[idx];
    if (!r) return "";
    if (r.status.includes("Thắng") || r.status.includes("Đã lên đơn") || r.status.includes("Đã thanh toán")) {
      return "bg-green-50/50 hover:bg-green-100/50";
    }
    if (r.status.includes("Hủy")) {
      return "bg-yellow-50/50 hover:bg-yellow-100/50";
    }
    if (r.status.includes("Bom") || r.status.includes("Thua")) {
      return "bg-red-50/50 hover:bg-red-100/50";
    }
    return "hover:bg-gray-50";
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      <Table
        columns={columns as any}
        dataSource={data.map((row, idx) => ({ ...row, key: idx }))}
        pagination={false}
        rowClassName={rowClassName}
        className="mb-0"
      />

      {/* <div className="flex justify-end items-center pt-4 mt-2 border-t border-gray-100">
        <div className="text-gray-500 text-sm mr-4">
          Hiển thị {startIndex + 1}-{actualEndIndex} / <b>{totalResults} kết quả</b>
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalResults}
          onChange={setCurrentPage}
          showSizeChanger={false}
          className="flex items-center"
          itemRender={(current, type, originalElement) => {
            if (type === 'prev') return <span className="font-semibold">Trước</span>;
            if (type === 'next') return <span className="font-semibold">Sau</span>;
            return originalElement;
          }}
        />
      </div> */}
    </div>
  );
};