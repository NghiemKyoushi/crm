import React, { useState } from "react";
import { Button, Tooltip, Table, Input, Pagination, Avatar, Modal, Radio } from "antd";
import { InfoCircleOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useAuctionCustomers } from "../hooks/aution-manage";
import { StatusTag } from "./tab-link"; // BidItem removed because it causes column rendering bug
import { toast } from "react-toastify";
import { DecisionMode } from "./modal/accept-modal";
import { BidDecisionCusModal } from "./modal/accept-customer-modal";
import { approveAuction, excuteAuction, rejectAuction } from "../apis/aution-manage";

// Updated types according to new API response

export interface LinkItem {
  auction_id: number;
  title: string;
  url: string;
  bid_price: number;
  bid_status: string;
  reason: string | null;
  bid_id: number
}

interface CustomerItem {
  user_id: number;
  full_name: string;
  vip_name: string;
  slot_used: number;
  slot_total: number;
  violation_count: number;
  is_blocked: boolean;
  avatar?: string;
  links: LinkItem[];
}

const formatBid = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

const LinkTable: React.FC<{
  links: LinkItem[];
  active: boolean;
  refetchData: ()=> void;
}> = ({ links, active, refetchData }) => {
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionMode, setDecisionMode] = useState<DecisionMode>("accept");
  const [selectedBid, setSelectedBid] = useState<LinkItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<LinkItem | null>(null);
  const [resultType, setResultType] = useState<"SUCCESS" | "FAILED" | null>(
    null
  );
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

  const openModal = (mode: DecisionMode, bid: LinkItem) => {
    setDecisionMode(mode);
    setSelectedBid(bid);
    setDecisionOpen(true);
  };

  const closeModal = () => {
    setDecisionOpen(false);
    setSelectedBid(null);
    setConfirmLoading(false);
  };

  const handleConfirmResult = async () => {
    if (!selectedRow || !resultType) return;
    setConfirmLoading(true);
    try {
      await excuteAuction(String(selectedRow.bid_id), {
        success: resultType === "SUCCESS" ? true : false,
      });
      toast.success("Xác định kết quả thành công");
      closeResultModal();
      refetchData();
    } catch (e) {
      // Handle error nếu có
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleConfirm = async (payload: {
    reason?: string;
    activateIfScheduled?: boolean;
    success?: boolean;
  }) => {
    if (!selectedBid) return;
    console.log('selectedBid', selectedBid);
    
    try {
      setConfirmLoading(true);
      if (decisionMode === "accept") {
        await approveAuction(String(selectedBid.bid_id));
        toast.success("Đã chấp nhận bid.");
      }
      if (decisionMode === "reject") {
        await rejectAuction(String(selectedBid.bid_id), {
          reason: payload.reason,
        });
        toast.success("Đã từ chối bid.");
      }
      refetchData();
      closeModal();
    } catch (e: any) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      setConfirmLoading(false);
    }
  };

  const onRefreshStatus = async (bid: LinkItem) => {
    // TODO: call API for new status for this bid
    toast.info("Đã làm mới trạng thái (demo).");
  };

  const columns = [
    {
      title: <span className="text-xs font-medium text-gray-500">Link</span>,
      dataIndex: "title",
      key: "title",
      width: 180,
      render: (text: string, record: LinkItem) => (
        <div>
          <Tooltip title={text}>
            <div
              className="font-medium text-sm truncate max-w-[152px]"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 160,
                display: "block",
              }}
            >
              {text}
            </div>
          </Tooltip>
          <div className="text-xs text-blue-600 truncate">
            {record?.auction_id ? `n${record.auction_id}` : ""}
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-xs font-medium text-gray-500">Bid</span>,
      dataIndex: "bid_price",
      key: "bid_price",
      width: 100,
      render: (val: number) => (
        <span className="text-green-600 font-semibold text-sm">
          {formatBid(val)}
        </span>
      ),
    },
    {
      title: (
        <span className="text-xs font-medium text-gray-500">Trạng thái</span>
      ),
      dataIndex: "bid_status",
      key: "bid_status",
      width: 120,
      render: (status: string) => {
        switch (status) {
          case "PENDING":
            return <StatusTag text="Chờ duyệt" type="warning" />;
          case "READY":
            return <StatusTag text="Sẵn sàng Sniper" type="info" />;
          case "REJECTED":
            return <StatusTag text="Từ chối" type="error" />;
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
      title: <span className="text-xs font-medium text-gray-500">Lý do</span>,
      dataIndex: "reason",
      key: "reason",
      width: 100,
      render: (reason: string | null | undefined) =>
        reason ? (
          <span className="text-red-500 text-sm">{reason}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: (
        <span className="text-xs font-medium text-gray-500">Thao tác</span>
      ),
      key: "actions",
      align: "right" as const,
      width: 150,
      render: (_: any, b: LinkItem) => {
        switch (b.bid_status) {
            case "PENDING":
              return (
                <div className="flex items-center justify-center gap-1.5">
                  <Tooltip title="Xác nhận đặt bid">
                    <Button
                      size="small"
                      type="default"
                      shape="round"
                      onClick={() => openModal("accept", b)}
                      className="!bg-green-50 hover:!bg-green-100 !border-green-100 text-green-600 transition flex items-center gap-1 px-2"
                    >
                      <span className="text-xs">Xác&nbsp;nhận</span>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Từ chối">
                    <Button
                      size="small"
                      type="default"
                      shape="round"
                      danger
                      onClick={() => openModal("reject", b)}
                      className="!bg-red-50 hover:!bg-red-100 !border-red-100 text-red-500 transition flex items-center gap-1 px-2"
                    >
                      <span className="text-xs">Từ&nbsp;chối</span>
                    </Button>
                  </Tooltip>
                </div>
              );

            case "USER_CANCELLED":
              return (
                <div className="flex items-center justify-center gap-1.5">
                  <Tooltip title="Bom trạng thái">
                    <Button
                      size="small"
                      type="default"
                      shape="round"
                      onClick={() => onRefreshStatus(b)}
                      className="!border-gray-200 !bg-white hover:!bg-gray-50 text-gray-400 transition px-3"
                    >
                      <span className="text-xs">bom</span>
                    </Button>
                  </Tooltip>
                </div>
              );
              case "APPROVED":
            return (
              <div className="flex items-center justify-center gap-1.5">
                <Tooltip title="Xác định kết quả đấu giá">
                  <Button
                    size="small"
                    type="primary"
                    className="!bg-green-50 !border-green-200 !text-green-600 font-medium"
                    style={{ padding: "0 12px" }}
                    icon={<InfoCircleOutlined />}
                    onClick={() => openResultModal(b)}
                  >
                    Kết&nbsp;quả
                  </Button>
                </Tooltip>
              </div>
            );
            default:
              return (
                <div className="flex items-center justify-center gap-1.5">
                  <Tooltip title="Đang xử lý">
                    <Button
                      size="small"
                      type="default"
                      shape="round"
                      disabled
                      className="!border-yellow-300 !bg-yellow-100 text-yellow-700 transition px-3"
                    >
                      <span className="text-xs">Đang xử lý</span>
                    </Button>
                  </Tooltip>
                </div>
              );
          }
      },
    },
  ];

  const rowClassName = (record: LinkItem) => {
    // Chỉ màu dựa trên bid_status
    if (record.bid_status === "PENDING") return "bg-yellow-50/70";
    if (record.bid_status === "REJECTED") return "bg-red-50/70";
    return "";
  };

  return (
    <div className="rounded-xl">
      <Table
        dataSource={(links || []).map((link, index) => ({
          ...link,
          key: index.toString(),
        }))}
        columns={columns}
        pagination={false}
        rowKey="key"
        showHeader
        size="middle"
        className="custom-customer-table !border-none"
        rowClassName={rowClassName}
        style={{ border: "none" }}
      />
      {selectedBid && (
        <BidDecisionCusModal
          mode={decisionMode}
          open={decisionOpen}
          bid={selectedBid}
          onCancel={closeModal}
          onConfirm={handleConfirm}
          confirmLoading={confirmLoading}
        />
      )}

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
            <b>{selectedRow?.title}</b>
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

const CustomerCard: React.FC<{ customer: CustomerItem , refetchData: ()=> void}> = ({ customer, refetchData }) => {
  // Blocked nếu violation_count >= 3 hoặc is_blocked trả về từ API
  const isBlocked =
    customer.is_blocked ||
    customer.violation_count >= 3 ||
    (customer.slot_used >= customer.slot_total && customer.violation_count === 3);
  const active = !isBlocked && customer.slot_used < customer.slot_total;

  const getAvatarText = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("");
  };
  const avatarText = getAvatarText(customer.full_name);

  const violationMessage =
    isBlocked && customer.violation_count >= 3
      ? "Không thể tạo phiên đấu giá mới do vi phạm quá số lần cho phép."
      : undefined;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 ${
        !active ? "border-red-400/50" : "hover:shadow-lg"
      } duration-200`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Avatar
            className={`w-12 h-12 text-lg font-bold flex-shrink-0 ${
              active ? "bg-blue-500" : "bg-red-400"
            }`}
            style={{
              width: 48,
              height: 48,
              fontSize: 20,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? "#3b82f6" : "#f87171",
            }}
            src={customer.avatar || undefined}
            icon={!customer.avatar ? <UserOutlined /> : undefined}
          >
            {!customer.avatar ? avatarText : null}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="font-bold text-lg text-gray-900 truncate">
              {customer.full_name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {customer.vip_name} • {customer.slot_used}/{customer.slot_total}{" "}
              slot • {customer.violation_count}/3 vi phạm
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          {active ? (
            <span className="text-green-600 text-sm font-semibold">
              Hoạt động
            </span>
          ) : (
            <span className="text-red-600 text-sm font-semibold">Bị khóa</span>
          )}
        </div>
      </div>
      {violationMessage && (
        <div className="my-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {violationMessage}
        </div>
      )}
      <LinkTable refetchData={refetchData} links={customer.links} active={active} />
    </div>
  );
};

export const TabCustomer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [size] = useState<number>(10);

  // Sử dụng hook để lấy danh sách khách hàng
  const { data, isLoading, refetch} = useAuctionCustomers({ page: currentPage, size });

  // Adjust mapping for new API response: "items" instead of "data"; page data on root data
  const customers: CustomerItem[] = data?.data?.data.items || [];
  console.log('customers', data?.data);
  
  const pageSize = data?.data?.page_size || 10;
  const totalItems = data?.data?.total_items || 0;

  return (
    <div className="p-4 bg-white border border-gray-100">
      <div className="flex justify-start mb-4">
        <Input
          placeholder="Tìm kiếm khách hàng..."
          prefix={<SearchOutlined />}
          className="w-80 h-10 rounded-lg"
          // onChange={} // TODO: optional sau nếu có filter/search
        />
      </div>
      <div className="space-y-7">
        {isLoading ? ( 
          <div className="text-center text-gray-400 py-12">Đang tải...</div>
        ) : customers.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Không có khách hàng nào.
          </div>
        ) : (
          customers.map((customer: CustomerItem) => (
            <CustomerCard refetchData ={refetch} key={customer.user_id} customer={customer} />
          ))
        )}
      </div>
      <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-8">
        <div className="text-gray-500 text-sm pl-1"></div>

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onChange={(page) => setCurrentPage(page)}
          size="small"
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};
