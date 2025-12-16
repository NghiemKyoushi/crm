import React, { useState } from "react";
import { Button, Select, Input, Spin, Modal } from "antd";
import {
  SearchOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuctionResultTab } from "../hooks/aution-manage";
import TableComponent from "@/components/TableComponent";
import { Tooltip } from "antd";
import { StatusTag } from "./tab-link";
import { toast } from "react-toastify";
import { createAuctionOrder, updateAuctionBOM } from "../apis/aution-manage";
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

interface ConfirmModalProps {
  open: boolean;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  loading?: boolean;
  okText?: string;
  cancelText?: string;
  okButtonProps?: any;
  onCancel: () => void;
  onOk: () => void;
}

// Status filter options according to prompt
const STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "FAILED", label: "Thua" },
  { value: "SUCCESS", label: "Thắng" },
];

// Use Ant Design Modal instead of the custom modal
const CustomConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  icon,
  content,
  loading,
  okText = "OK",
  cancelText = "Huỷ",
  okButtonProps = {},
  onCancel,
  onOk,
}) => {
  return (
    <Modal
      open={open}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span>{title}</span>
        </div>
      }
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{
        loading: loading,
        ...okButtonProps,
      }}
      cancelButtonProps={{
        disabled: loading,
      }}
      maskClosable={false}
      destroyOnClose
      centered
      closable={!loading}
    >
      {content}
    </Modal>
  );
};

export const TabResult = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Use correct value for status filter and input search
  const [status, setStatus] = useState<string>(""); // value = status, default "", which is "Tất cả"
  const [search, setSearch] = useState<string>(""); // value search cho input

  const { data, isLoading, refetch } = useAuctionResultTab({
    page: currentPage - 1,
    size: pageSize,
    status,
    search,
  });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingBom, setLoadingBom] = useState(false);

  // Add Reason state
  const [bomReason, setBomReason] = useState<string>("");

  const [modalState, setModalState] = useState<{
    open: boolean;
    type: "createOrder" | "bom" | null;
    record: any;
  }>({ open: false, type: null, record: null });

  const items = data?.items || [];

  // Custom handler for creating order using custom modal
  const handleCreateOrder = (record: any) => {
    setModalState({ open: true, type: "createOrder", record });
  };

  // Custom handler for "Bom" action using custom modal
  const handleBom = (record: any) => {
    setBomReason(""); // reset when opening
    setModalState({ open: true, type: "bom", record });
  };

  const handleModalCancel = () => {
    if (loadingCreate || loadingBom) return;
    setModalState({ open: false, type: null, record: null });
    setBomReason("");
  };

  const handleModalOk = async () => {
    if (modalState.type === "createOrder" && modalState.record) {
      setLoadingCreate(true);
      try {
        await createAuctionOrder(String(modalState.record.auction_id));
        toast.success("Tạo đơn thành công!");
        setModalState({ open: false, type: null, record: null });
        refetch?.();
      } catch (e: any) {
        toast.error(e?.message || "Tạo đơn thất bại!");
      } finally {
        setLoadingCreate(false);
      }
    }
    if (modalState.type === "bom" && modalState.record) {
      if (!bomReason.trim()) {
        toast.error("Vui lòng nhập lý do bom.");
        return;
      }
      setLoadingBom(true);
      try {
        await updateAuctionBOM(modalState.record.bid_id, {
          reasontype: "SUBJECTIVE",
          reason: bomReason,
        });
        toast.success("Bom thành công!");
        setModalState({ open: false, type: null, record: null });
        setBomReason("");
        refetch?.();
      } catch (e: any) {
        toast.error(e?.message || "Bom thất bại!");
      } finally {
        setLoadingBom(false);
      }
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
          case "BOM_CANCELLED":
            return <StatusTag text="Bom" type="error" />;
          case "USER_CANCELLED":
            return <StatusTag text="Người dùng huỷ" type="error" />;
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
          {record.bid_status === "SUCCESS" && record.order_status === "PENDING" ? (
            <div className="flex flex-row gap-2">
              {/* <Tooltip title="Tạo đơn hàng">
                <Button
                  size="small"
                  type="primary"
                  className="!bg-green-50 !border-green-200 !text-green-700 font-medium"
                  style={{ padding: "0 12px" }}
                  loading={loadingCreate}
                  onClick={() => handleCreateOrder(record)}
                >
                  Tạo&nbsp;đơn
                </Button>
              </Tooltip> */}
              <Tooltip title="Bom">
                <Button
                  size="small"
                  type="default"
                  className="bg-red-50 border border-red-200 text-red-700 font-medium"
                  style={{ padding: "0 12px" }}
                  loading={loadingBom}
                  onClick={() => handleBom(record)}
                >
                  Bom
                </Button>
              </Tooltip>
            </div>
          ) 
          // : record.order_status === "PENDING" ? (
          //   <Tooltip title="Hoàn thành">
          //     <Button
          //       size="small"
          //       type="primary"
          //       className="bg-gray-100 border border-gray-200 text-gray-500 font-medium"
          //       style={{ padding: "0 12px" }}
          //       icon={<InfoCircleOutlined />}
          //       disabled
          //     >
          //       Hoàn&nbsp;thành
          //     </Button>
          //   </Tooltip>
          // ) 
          : (
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
        <Select
          value={status}
          className="w-[150px]"
          onChange={(value) => {
            setStatus(value);
            setCurrentPage(1);
          }}
        >
          {STATUS_FILTERS.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.label}
            </Option>
          ))}
        </Select>
        <Input
          placeholder="Tìm kiếm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          prefix={<SearchOutlined className="text-gray-400" />}
          className="!w-[300px]"
        />
      </div>

      <Spin spinning={isLoading}>
        <TableComponent
          columns={columns as any}
          dataSource={items.map((item: any) => ({
            ...item,
            key: item.user_id,
          }))}
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
          page={currentPage}
          response={data}
        />
      </Spin>

      {/* Custom Modal for Tạo đơn/Bom */}
      <CustomConfirmModal
        open={modalState.open}
        title={
          modalState.type === "createOrder"
            ? "Xác nhận tạo đơn hàng?"
            : modalState.type === "bom"
            ? "Xác nhận Bom đơn hàng?"
            : ""
        }
        icon={<ExclamationCircleOutlined />}
        content={
          modalState.record && (
            <div>
              <div>
                {modalState.type === "createOrder"
                  ? "Bạn có chắc chắn muốn tạo đơn hàng cho:"
                  : "Bạn có chắc chắn muốn thực hiện thao tác Bom cho đơn này?"}
              </div>
              <div className="font-semibold mt-1">
                {modalState.record.title}
              </div>
              <div className="text-xs text-gray-600 break-words">
                {modalState.record.url}
              </div>
              {modalState.type === "bom" && (
                <div style={{ marginTop: 16 }}>
                  <label className="block font-medium mb-1">
                    Lý do bom<span style={{ color: "red" }}>*</span>:
                  </label>
                  <Input.TextArea
                    rows={3}
                    placeholder="Nhập lý do bom (bắt buộc)"
                    value={bomReason}
                    onChange={(e) => setBomReason(e.target.value)}
                    disabled={loadingBom}
                    maxLength={200}
                  />
                </div>
              )}
            </div>
          )
        }
        okText={
          modalState.type === "createOrder"
            ? "Tạo đơn"
            : modalState.type === "bom"
            ? "Bom"
            : "OK"
        }
        cancelText="Huỷ"
        loading={modalState.type === "createOrder" ? loadingCreate : loadingBom}
        okButtonProps={{
          danger: modalState.type === "bom",
          type: "primary",
          disabled:
            modalState.type === "bom"
              ? loadingBom || !bomReason.trim()
              : undefined,
        }}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};
