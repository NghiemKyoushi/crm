import React, { useState } from "react";
import { Table, Button, Pagination, Select, Input, Spin } from "antd";
import { StatusTag } from "./status-tag";
import { SearchOutlined } from "@ant-design/icons";
import { useAuctionResultTab } from "../hooks/aution-manage";
import TableComponent from "@/components/TableComponent";

const { Option } = Select;

// Chuyển format loại trạng thái cho StatusTag
const colorStatus = (s: string) => {
  if (s?.includes("Thắng") || s?.includes("Đã thanh toán")) return "success";
  if (s?.includes("Đã lên đơn")) return "info";
  if (s?.includes("Hủy")) return "warning";
  if (s?.includes("Thua") || s?.includes("Bom")) return "error";
  return "info";
};

export const TabResult = () => {
  // Trang mặc định của API là 0, nhưng Antd Pagination bắt đầu từ 1
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // API default page size là 20

  // State cho filter nếu có (placeholder)
  const [statusFilter] = useState<string>("all-status");
  const [searchCustomer] = useState<string>("");

  // Gọi data từ useAuctionResultTab, truyền paging info
  const { data, isLoading } = useAuctionResultTab({
    page: currentPage - 1,
    size: pageSize,
    // Có thể bổ sung filter khách hàng, trạng thái nếu API hỗ trợ
  });
console.log('data', data);

  // Lấy danh sách items và paging info
  const items = data?.items || [];
  const totalItems = data?.total_items || 0;
  const pageSz = data?.page_size || pageSize;
  // page index của API là 0-base
  const startIndex = ((currentPage - 1) * pageSz) + (items.length === 0 ? 0 : 1);
  const actualEndIndex = items.length > 0 ? (startIndex - 1 + items.length) : 0;

  // Tạm thời: Định nghĩa cột mẫu, mapping thử theo "items" trả về thực tế
  const columns = [
    {
      title: "KHÁCH",
      dataIndex: "full_name",
      key: "full_name",
      width: "22%",
      render: (name: string, record: any) => (
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "VIP",
      dataIndex: "vip_name",
      key: "vip_name",
      width: "12%",
      render: (vip: string) => (
        <span className="text-blue-700 font-medium">{vip}</span>
      ),
    },
    {
      title: "Slot đã dùng",
      dataIndex: "slot_used",
      key: "slot_used",
      width: "11%",
      align: "center" as any,
      render: (used: number, record: any) => (
        <span>
          {used}/{record.slot_total}
        </span>
      ),
    },
    {
      title: "Vi phạm",
      dataIndex: "violation_count",
      key: "violation_count",
      width: "8%",
      align: "center" as any,
      render: (violation: number) =>
        violation > 0 ? (
          <span className="text-red-700 font-semibold">{violation}</span>
        ) : (
          <span>0</span>
        ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "is_blocked",
      key: "is_blocked",
      width: "12%",
      render: (is_blocked: boolean) => (
        <StatusTag
          text={is_blocked ? "Bị khóa" : "Hoạt động"}
          type={is_blocked ? "warning" : "success"}
        />
      ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      width: "20%",
      render: (_: any, record: any) => (
        <div className="flex gap-1">
          {!record.is_blocked && (
            <>
              <Button
                type="primary"
                size="small"
                className="h-7 px-3 font-medium rounded-lg"
              >
                Tạo đơn
              </Button>
              <Button
                danger
                size="small"
                className="h-7 px-3 font-medium rounded-lg"
              >
                Hủy đơn
              </Button>
              <Button
                danger
                size="small"
                className="h-7 px-3 font-medium rounded-lg"
              >
                Bom
              </Button>
            </>
          )}
          {record.is_blocked && (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
  ];

  // Khi loading thì hiển thị spiner ở bảng
  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Select value={statusFilter} className="w-[150px]" disabled>
          <Option value="all-status">Trạng thái</Option>
          <Option value="active">Hoạt động</Option>
          <Option value="locked">Bị khóa</Option>
        </Select>
        <Input
          placeholder="Tìm khách hàng..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="!w-[300px]"
          disabled
        />
      </div>

      <Spin spinning={isLoading}>
        <TableComponent
          columns={columns as any}
          dataSource={items.map((item: any) => ({ ...item, key: item.user_id }))}
          pagination={false}
          rowClassName={(_, idx: number) => {
            const r = items[idx];
            if (!r) return "";
            if (!r.is_blocked && r.violation_count === 0) {
              return "bg-green-50/50 hover:bg-green-100/50";
            }
            if (r.is_blocked) {
              return "bg-yellow-50/50 hover:bg-yellow-100/50";
            }
            if (r.violation_count > 0) {
              return "bg-red-50/50 hover:bg-red-100/50";
            }
            return "hover:bg-gray-50";
          }}
          className="mb-0"
          onPageChange={setCurrentPage}
          page={currentPage - 1}
          response={items}

        />
      </Spin>

      {/* <div className="flex justify-end items-center pt-4 mt-2 border-t border-gray-100">
        <div className="text-gray-500 text-sm mr-4">
          Hiển thị {startIndex}-{actualEndIndex} / <b>{totalItems} kết quả</b>
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSz}
          total={totalItems}
          onChange={setCurrentPage}
          showSizeChanger={false}
          className="flex items-center"
          itemRender={(current, type, originalElement) => {
            if (type === "prev") return <span className="font-semibold">Trước</span>;
            if (type === "next") return <span className="font-semibold">Sau</span>;
            return originalElement;
          }}
        />
      </div> */}
    </div>
  );
};
