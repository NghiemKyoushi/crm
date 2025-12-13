import React, { useState } from "react";
import { Button, Select, Input, Spin, Modal, Radio } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useAuctionResultTab } from "../hooks/aution-manage";
import TableComponent from "@/components/TableComponent";
import { Tooltip } from "antd";
import { StatusTag } from "./tab-link";
import { excuteAuction } from "../apis/aution-manage";
import { toast } from "react-toastify";
const { Option } = Select;

export type AuctionResultItem = {
  auction_id: number;
  url: string;
  title: string;
  image: string;
  user_id: number;
  full_name: string;
  bid_id: number;
  bid_price: number;
  bid_status: string;
  order_status: string | null;
  slot_returned: string;
};
export const TabResult = () => {
  // Trang mặc định của API là 0, nhưng Antd Pagination bắt đầu từ 1
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // API default page size là 20
  const [statusFilter] = useState<string>("all-status");
  const [searchCustomer] = useState<string>("");
  const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<AuctionResultItem | null>(
    null
  );
  const [resultType, setResultType] = useState<"SUCCESS" | "FAILED" | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const { data, isLoading, refetch } = useAuctionResultTab({
    page: currentPage - 1,
    size: pageSize,
    // Có thể bổ sung filter khách hàng, trạng thái nếu API hỗ trợ
  });
  const items = data?.items || [];
  const openResultModal = (record: any) => {
    setSelectedRow(record);
    setResultType(null);
    setResultModalOpen(true);
  };
  const closeResultModal = () => {
    setResultModalOpen(false);
    setSelectedRow(null);
    setResultType(null);
  };

  // Dummy handle confirm, bạn thay chỗ này để call API thực tế xác nhận kết quả
  const handleConfirmResult = async () => {
    if (!selectedRow || !resultType) return;
    setConfirmLoading(true);
    try {
      await excuteAuction(String(selectedRow.bid_id), {
        success: resultType === "SUCCESS" ? true : false,
      });
      toast.success("Xác định kết quả thành công");
      closeResultModal();
      refetch();
      // Có thể refetch lại data nếu muốn
    } catch (e) {
      // Handle error nếu có
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: "SẢN PHẨM",
      key: "auction_info",
      width: 220,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          {record.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={record.image}
              alt={record.title}
              className="w-14 h-14 object-cover rounded border flex-shrink-0"
              style={{
                minWidth: 56,
                minHeight: 56,
                maxWidth: 56,
                maxHeight: 56,
              }}
            />
          ) : (
            <div
              className="w-14 h-14 flex items-center justify-center bg-gray-100 text-gray-400 rounded border text-xs flex-shrink-0"
              style={{ minWidth: 56, minHeight: 56 }}
            >
              No Image
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Tooltip title={record.title}>
              <div
                className="font-semibold text-gray-900 truncate"
                style={{
                  maxWidth: 135,
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.title}
              </div>
            </Tooltip>
            <a
              href={record.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-words"
              style={{ wordBreak: "break-all" }}
            >
              {record.url}
            </a>
          </div>
        </div>
      ),
    },
    {
      title: "KHÁCH",
      dataIndex: "full_name",
      key: "full_name",
      width: 140,
      render: (name: string, record: any) => (
        <div>
          <div className="font-semibold text-gray-900 truncate" title={name}>
            {name}
          </div>
          {record.email && (
            <div className="text-xs text-gray-500 truncate">{record.email}</div>
          )}
        </div>
      ),
    },
    {
      title: "VIP",
      dataIndex: "vip_name",
      key: "vip_name",
      width: 70,
      render: (vip: string) => (
        <span className="text-blue-700 font-medium">{vip}</span>
      ),
    },
    {
      title: "Giá (¥)",
      dataIndex: "bid_price",
      key: "bid_price",
      width: 100,
      align: "right" as any,
      render: (bid_price: number) =>
        bid_price ? (
          <span className="text-green-700 font-bold">
            {bid_price.toLocaleString("ja-JP", {
              style: "currency",
              currency: "JPY",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: (
        <span className="font-medium text-xs text-gray-500">Trạng thái</span>
      ),
      dataIndex: "bid_status",
      key: "bid_status",
      width: 150,
      align: "center" as const,
      render: (bid_status: string) => {
        switch (bid_status) {
          case "PENDING":
            return <StatusTag text="Chờ duyệt" type="warning" />;
          case "READY":
            return <StatusTag text="Sẵn sàng Sniper" type="info" />;
          case "REJECTED":
            return <StatusTag text="Từ chối" type="info" />;
          case "FAILED":
            return <StatusTag text="Thua" type="error" />;
          case "APPROVED":
            return <StatusTag text="Đã duyệt" type="info" />;
          case "SUCCESS":
            return <StatusTag text="Thắng" type="success" />;
          default:
            return null;
        }
      },
    },
    {
      title: "Slot hoàn lại",
      dataIndex: "slot_returned",
      key: "slot_returned",
      width: 80,
      align: "center" as any,
      render: (slot: string) => <span>{slot || "-"}</span>,
    },
    {
      title: "THAO TÁC",
      key: "actions",
      align: "center" as any,
      width: 110,
      render: (_: any, record: any) => (
        <div className="flex justify-center items-center gap-2">
          {record.bid_status === "APPROVED" ? (
            <Tooltip title="Xác định kết quả đấu giá">
              <Button
                size="small"
                type="primary"
                className="bg-blue-50 border border-blue-200 text-blue-600 font-medium"
                style={{ padding: "0 12px" }}
                icon={<InfoCircleOutlined />}
                onClick={() => openResultModal(record)}
              >
                Xác định&nbsp;kết&nbsp;quả
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Hoàn thành">
              <Button
                size="small"
                type="primary"
                className="bg-gray-100 border border-gray-200 text-gray-500 font-medium"
                style={{ padding: "0 12px" }}
                icon={<InfoCircleOutlined />}
                disabled
              >
                Hoàn&nbsp;thành
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

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
          dataSource={items.map((item: any) => ({
            ...item,
            key: item.user_id,
          }))}
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

      <Modal
        open={resultModalOpen}
        onCancel={closeResultModal}
        title="Xác nhận kết quả đấu giá"
        okText="Xác nhận"
        okButtonProps={{ disabled: !resultType, loading: confirmLoading }}
        cancelButtonProps={{ disabled: confirmLoading }}
        onOk={handleConfirmResult}
        destroyOnClose
      >
        <div>
          <p>
            Bạn hãy chọn kết quả đấu giá cho khách&nbsp;
            <b>{selectedRow?.full_name}</b>
            {selectedRow?.title ? (
              <>
                &nbsp;- Sản phẩm:{" "}
                <span className="font-semibold">{selectedRow?.title}</span>
              </>
            ) : null}
          </p>
          <Radio.Group
            className="mt-3 flex flex-col gap-2"
            value={resultType}
            onChange={(e) => setResultType(e.target.value)}
            disabled={confirmLoading}
          >
            <Radio value="SUCCESS">
              Đấu giá <b className="text-green-600">thắng</b>
            </Radio>
            <Radio value="FAILED">
              Đấu giá <b className="text-red-600">thua</b>
            </Radio>
          </Radio.Group>
        </div>
      </Modal>
    </div>
  );
};
