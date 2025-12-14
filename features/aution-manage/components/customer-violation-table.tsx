"use client";

import React, { useState, useEffect } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Table, Spin, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuctionViolate } from "../hooks/aution-manage";
import TableComponent from "@/components/TableComponent";
import { deleteAuctionViolate } from "../apis/aution-manage";
import { fetchAuctionViolate } from "../apis/aution-manage";

// API item kiểu dữ liệu
interface ApiRowItem {
  penalty_id: number;
  date: string;
  user_id: number;
  full_name: string;
  title: string;
  reason: string;
  violation_count: number | null;
}

// Thêm kiểu cho summary API
interface ViolationSummary {
  total_blocked_users: number;
  total_monthly_violations: number;
}

export const CustomerViolationTable: React.FC = () => {
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // State cho modal xác nhận xoá
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // State để lưu thông tin tổng quan
  const [violationSummary, setViolationSummary] = useState<ViolationSummary>({
    total_blocked_users: 0,
    total_monthly_violations: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // Lấy data và loading state từ hook
  const {
    data,
    isLoading,
    refetch,
  } = useAuctionViolate({
    page: currentPage - 1,
    size: pageSize,
  });
  const items: ApiRowItem[] = data?.items || [];

  // Lấy summary
  useEffect(() => {
    let ignore = false;

    async function getSummary() {
      setSummaryLoading(true);
      try {
        const response = await fetchAuctionViolate();
        console.log('response', response);
        
        // Response dạng { total_blocked_users, total_monthly_violations }
        if (!ignore && response) {
          setViolationSummary({
            total_blocked_users: response?.total_blocked_users ?? 0,
            total_monthly_violations: response?.total_monthly_violations ?? 0,
          });
        }
      } catch (e) {
        if (!ignore) {
          setViolationSummary({
            total_blocked_users: 0,
            total_monthly_violations: 0,
          });
        }
      } finally {
        if (!ignore) setSummaryLoading(false);
      }
    }

    getSummary();

    // Cleanup
    return () => {
      ignore = true;
    };
  }, []);

  // Map API data sang "RowItem" dùng cho bảng
  type TableRow = {
    key: string;
    date: string;
    customer: string;
    count: number;
    link: string;
    reason: string;
    reasonType?: "danger" | "warning" | "normal";
    penalty_id: number;
  };

  const rows: TableRow[] = items.map((item) => {
    // Extract (count/x) from full_name or violation_count if available
    const match = item.full_name.match(/\((\d+)\/(\d+)\)/);
    const count = item.violation_count ?? (match ? parseInt(match[1]) : 1);
    // Chỉ là ví dụ link, thật ra API không trả link nên tạm dùng title
    const link =
      item.title?.length > 30
        ? `${item.title.substring(0, 27)}...`
        : item.title ?? "Sản phẩm";

    // Tag danger nếu count >= 3, warning nếu count = 2, normal nếu thấp hơn
    let reasonType: TableRow["reasonType"] = "normal";
    if (count >= 3) reasonType = "danger";
    else if (count === 2) reasonType = "warning";

    // Lấy tên khách cho đẹp (removes count in full_name)
    const customer = item.full_name.replace(/\s*\(\d+\/\d+\)/, "");

    return {
      key: String(item.penalty_id),
      date: item.date,
      customer,
      count,
      link,
      reason: item.reason,
      reasonType,
      penalty_id: item.penalty_id,
    };
  });

  // Tìm thông tin khách đang chuẩn bị xoá để note trong modal
  const deletingCustomer =
    deletingId !== null
      ? rows.find((row) => row.penalty_id === deletingId)?.customer
      : null;

  // Handler xác nhận xoá
  const handleDelete = async (penalty_id: number) => {
    setDeleteLoading(true);
    try {
      await deleteAuctionViolate(penalty_id);
      message.success("Đã xoá khách khỏi danh sách vi phạm!");
      setDeletingId(null);
      // Gọi lại data
      refetch();
      // Gọi lại summary
      setSummaryLoading(true);
      const response = await fetchAuctionViolate({});
      setViolationSummary({
        total_blocked_users: response?.total_blocked_users ?? 0,
        total_monthly_violations: response?.total_monthly_violations ?? 0,
      });
      setSummaryLoading(false);
    } catch (err) {
      message.error("Xoá thất bại, vui lòng thử lại!");
      setSummaryLoading(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: ColumnsType<TableRow> = [
    {
      title: <span className="px-4 py-3">NGÀY</span>,
      dataIndex: "date",
      key: "date",
      render: (date: string) => <span className="text-gray-600">{date}</span>,
      className: "px-4 py-3",
    },
    {
      title: <span className="px-4 py-3">KHÁCH</span>,
      dataIndex: "customer",
      key: "customer",
      render: (_: any, record: TableRow) => (
        <span className="font-medium text-gray-800">
          {record.customer}{" "}
          <span className="text-red-500 text-sm">({record.count}/3)</span>
        </span>
      ),
      className: "px-4 py-3",
    },
    {
      title: <span className="px-4 py-3">LINK</span>,
      dataIndex: "link",
      key: "link",
      render: (link: string) => <span className="text-gray-700">{link}</span>,
      className: "px-4 py-3",
    },
    {
      title: <span className="px-4 py-3">LÝ DO</span>,
      dataIndex: "reason",
      key: "reason",
      render: (_: string, record: TableRow) => (
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
      className: "px-4 py-3",
    },
    {
      title: <span className="px-4 py-3 text-center block">THAO TÁC</span>,
      key: "actions",
      align: "center",
      render: (_: any, record: TableRow) => (
        <button
          className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 transition mx-auto"
          onClick={() => setDeletingId(record.penalty_id)}
        >
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      ),
      className: "px-4 py-3 text-center",
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* --- TOP STATS --- */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Khách bị khóa */}
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-red-600 font-medium">Khách bị khóa</p>
          <p className="text-3xl font-bold text-red-600">
            {summaryLoading ? (
              <span className="animate-pulse">-- người</span>
            ) : (
              <>
                {violationSummary.total_blocked_users} người
              </>
            )}
          </p>
        </div>
        {/* Bom hàng tháng này */}
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
          <p className="text-orange-600 font-medium">Bom hàng tháng này</p>
          <p className="text-3xl font-bold text-orange-600">
            {summaryLoading ? (
              <span className="animate-pulse">-- lượt</span>
            ) : (
              <>
                {violationSummary.total_monthly_violations} lượt
              </>
            )}
          </p>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <Spin spinning={isLoading || deleteLoading}>
          <TableComponent
            dataSource={rows}
            columns={columns}
            pagination={false}
            rowClassName={(_, index) =>
              "border-t border-gray-100 hover:bg-gray-50 transition text-sm"
            }
            showHeader
            size="middle"
            className="w-full !border-none custom-customer-table"
            scroll={{ x: true }}
            onPageChange={(page: number) => setCurrentPage(page)}
            page={currentPage}
            response={data}
          />
        </Spin>
      </div>

      {/* Modal xác nhận xoá */}
      <Modal
        open={deletingId !== null}
        title="Xác nhận xoá khách khỏi danh sách vi phạm?"
        onOk={() => deletingId && handleDelete(deletingId)}
        confirmLoading={deleteLoading}
        onCancel={() => setDeletingId(null)}
        okText="Xoá"
        cancelText="Huỷ"
        centered
      >
        <p>
          Bạn muốn xoá khách
          {deletingCustomer ? (
            <>
              {" "}
              <span className="font-semibold">{deletingCustomer}</span>
            </>
          ) : null}
          khỏi danh sách vi phạm và cho phép tiếp tục đấu giá?
        </p>
      </Modal>
    </div>
  );
};
