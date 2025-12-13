import React, { useState, useMemo } from "react";
import { Button, Tooltip, Pagination, Table } from "antd";
import { LinkOutlined, SearchOutlined } from "@ant-design/icons";
import { BidDecisionModal, DecisionMode } from "./modal/accept-modal";
import { toast } from "react-toastify";
import { useAuctionLinks } from "../hooks/aution-manage";
import {
  approveAuction,
  excuteAuction,
  rejectAuction,
} from "../apis/aution-manage";
import dayjs from "dayjs";

interface StatusTagProps {
  text: string;
  type: "warning" | "info" | "error" | "default" | "success";
}

export const StatusTag: React.FC<StatusTagProps> = ({ text, type }) => {
  let colorClass = "bg-gray-50 text-gray-700 border-gray-200";
  if (type === "warning")
    colorClass = "bg-yellow-50 text-yellow-800 border-yellow-200";
  if (type === "info") colorClass = "bg-blue-50 text-blue-700 border-blue-200";
  if (type === "error") colorClass = "bg-red-50 text-red-700 border-red-100";
  if (type === "error") colorClass = "bg-red-50 text-red-700 border-red-100";
  if (type === "success")
    colorClass = "bg-green-50 text-green-700 border-green-100";

  return (
    <span
      className={`px-3 py-0.5 rounded-2xl text-xs font-semibold border ${colorClass} transition-colors duration-200`}
    >
      {text}
    </span>
  );
};

// Update FlatRow and related types to match new API response
type FlatRow = {
  key: string;
  auction_id: number;
  title: string;
  url: string;
  end_time: string;
  thumbnail: string; // from image
  full_name: string;
  vip_level: string; // from vip_name
  bid_amount: number; // from bid_price
  status: string; // from bid_status
  reason: string;
  isGroupStart: boolean;
  id?: number;
  bid_id?: number;
  auction_type?: string;
  user_id?: number;
  bid_time?: string;
};

export type BidItem = Omit<
  FlatRow,
  "title" | "url" | "thumbnail" | "end_time" | "auctionId" | "isGroupStart"
>;

type GroupedRow = {
  auction_id: number;
  title: string;
  url: string;
  end_time: string;
  thumbnail: string;
  bids: BidItem[];
  isGroupStart: boolean;
  key: string;
  bid_id?: number;
};

function flattenBids(data: any[]): FlatRow[] {
  const result: FlatRow[] = [];
  data.forEach((auctionItem) => {
    const users = auctionItem.users || [];
    users.forEach((user: any, idx: number) => {
      result.push({
        key: `${auctionItem.auction_id}-${user.user_id}`,
        auction_id: auctionItem.auction_id,
        title: auctionItem.title,
        url: auctionItem.url,
        end_time: auctionItem.end_time,
        thumbnail: auctionItem.image, // new field
        full_name: user.full_name,
        vip_level: user.vip_name,
        bid_amount: user.bid_price,
        status: user.bid_status,
        reason: user.reason || "",
        isGroupStart: idx === 0,
        user_id: user.user_id,
        bid_time: user.bid_time,
        bid_id: user.bid_id,
        // id, bid_id, auction_type not available in sample response but keep assignment for extendability
      });
    });
  });
  return result;
}

const ProductCard = ({
  item,
  refreshData,
}: {
  item: GroupedRow;
  refreshData: () => void;
}) => {
  const columns = [
    {
      title: <span className="font-medium text-xs text-gray-500">Khách</span>,
      dataIndex: "full_name",
      key: "full_name",
      width: 170,
      render: (text: string, record: BidItem) => (
        <div className="flex items-center gap-2">
          <span className="font-medium whitespace-nowrap text-gray-900">
            {text}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 font-medium">
            {record.vip_level}
          </span>
        </div>
      ),
    },
    {
      title: <span className="font-medium text-xs text-gray-500">Bid</span>,
      dataIndex: "bid_amount",
      key: "bid_amount",
      width: 80,
      render: (amount: number) => (
        <span className="text-green-600 font-semibold">
          {amount.toLocaleString("ja-JP", {
            style: "currency",
            currency: "JPY",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </span>
      ),
    },
    {
      title: (
        <span className="font-medium text-xs text-gray-500">Trạng thái</span>
      ),
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center" as const,
      render: (status: string) => {
        switch (status) {
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
      title: <span className="font-medium text-xs text-gray-500">Lý do</span>,
      dataIndex: "reason",
      key: "reason",
      width: 120,
      render: (reason: string) =>
        reason ? (
          <span className="text-gray-500 text-xs">{reason}</span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      title: (
        <span className="font-medium text-xs text-gray-500">Thao tác</span>
      ),
      key: "actions",
      width: 112,
      align: "center" as const,
      render: (_: any, b: BidItem) => {
        switch (b.status) {
          case "PENDING":
            return (
              <div className="flex items-center justify-center gap-1.5">
                <Tooltip title="Xác nhận đặt bid">
                  <Button
                    size="small"
                    type="default"
                    shape="round"
                    onClick={() => openModal("accept", b, item.auction_id)}
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
                    onClick={() => openModal("reject", b, item.auction_id)}
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

  const rowClassName = (b: BidItem) => {
    if (b.status === "Chờ duyệt") return "bg-yellow-50/90";
    if (b.status === "Từ chối") return "bg-red-50/80";
    return "hover:bg-gray-50";
  };

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionMode, setDecisionMode] = useState<DecisionMode>("accept");
  const [selectedBid, setSelectedBid] = useState<BidItem | null>(null);
  const [selectedAutionId, setSelectedAutionId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const openModal = (mode: DecisionMode, bid: BidItem, autionId: number) => {
    setDecisionMode(mode);
    setSelectedBid(bid);
    setSelectedAutionId(autionId);
    setDecisionOpen(true);
  };

  const closeModal = () => {
    setDecisionOpen(false);
    setSelectedBid(null);
    setSelectedAutionId(null);
    setConfirmLoading(false);
  };

  const handleConfirm = async (payload: {
    reason?: string;
    activateIfScheduled?: boolean;
    success?: boolean;
  }) => {
    if (!selectedBid) return;
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
      refreshData();
      closeModal();
    } catch (e: any) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      setConfirmLoading(false);
    }
  };

  const onRefreshStatus = async (bid: BidItem) => {
    // TODO: gọi API để lấy trạng thái mới nhất cho bid này
    toast.info("Đã làm mới trạng thái (demo).");
  };

  return (
    <div
      key={item.key}
      className="bg-white rounded-2xl border-gray-100 hover:shadow transition-shadow duration-200"
    >
      {item.isGroupStart && (
        <div className="flex items-center gap-4 px-5 pt-5 pb-4 border-b border-gray-100 bg-gray-200 rounded-t-2xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-500 text-base font-bold shadow-inner">
            {item.title.split(" ")[0][0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base text-gray-900 truncate">
              {item.title}
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 text-xs hover:text-blue-700 transition-colors leading-4 mt-1"
            >
              <LinkOutlined className="align-middle text-[11px] opacity-80" />
              <span className="truncate max-w-[170px]" title={item.url}>
                {item.url}
              </span>
            </a>
            {/* Optionally, show thumbnail if available */}
            {/* {item.thumbnail && (
              <img src={item.thumbnail} alt={item.title} className="w-10 h-10 rounded mt-1" />
            )} */}
          </div>
          <div className="flex flex-col items-end ml-2 flex-shrink-0">
            <span className="text-gray-400 text-xs tracking-tight">
              Kết thúc
            </span>
            <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-700 text-xs font-medium border border-gray-200">
              {item.end_time
                ? (() => {
                    const hasSeconds = /\d{2}:\d{2}:\d{2}/.test(item.end_time);
                    return hasSeconds
                      ? dayjs(item.end_time).format("YYYY-MM-DD HH:mm:ss")
                      : dayjs(item.end_time).format("YYYY-MM-DD HH:mm");
                  })()
                : ""}
            </span>
          </div>
        </div>
      )}

      <div
        className={` ${
          item.isGroupStart ? "" : "rounded-2xl"
        } overflow-x-auto bg-white`}
        style={{ background: "transparent" }}
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={item.bids}
          pagination={false}
          showHeader
          className="w-full text-[15px] custom-antd-table !border-none"
          rowClassName={rowClassName}
          components={{
            body: {
              wrapper: (
                props: React.HTMLAttributes<HTMLTableSectionElement>
              ) => <tbody {...props} style={{ border: "none" }} />,
            },
          }}
          style={{ border: "none" }}
        />
        {selectedBid && (
          <BidDecisionModal
            mode={decisionMode}
            open={decisionOpen}
            bid={selectedBid}
            onCancel={closeModal}
            onConfirm={handleConfirm}
            confirmLoading={confirmLoading}
          />
        )}
      </div>
    </div>
  );
};

export const TabLink = () => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const { data, isLoading, refetch } = useAuctionLinks({
    page: currentPage,
    size: pageSize,
  });
  const rawAuctions = data?.data?.data.items ?? [];
  // log for debug
  console.log("rawAuctions", data?.data);

  const allRows = useMemo(() => flattenBids(rawAuctions), [rawAuctions]);
  const groupedRows = useMemo(() => {
    // Now grouping should be much simpler since the data is already normalized!
    const groups: GroupedRow[] = [];
    let prevAuctionId: number | null = null;
    let currentGroup: GroupedRow | null = null;
    for (let i = 0; i < allRows.length; ++i) {
      const row = allRows[i];
      const isNewGroup = row.auction_id !== prevAuctionId;
      if (isNewGroup) {
        currentGroup = {
          auction_id: row.auction_id,
          bid_id: row?.bid_id,
          title: row.title,
          url: row.url,
          end_time: row.end_time,
          thumbnail: row.thumbnail,
          bids: [],
          isGroupStart: true,
          key: row.key,
        };
        groups.push(currentGroup);
        prevAuctionId = row.auction_id;
      }
      currentGroup?.bids.push({
        key: row.key,
        full_name: row.full_name,
        vip_level: row.vip_level,
        bid_amount: row.bid_amount,
        status: row.status,
        reason: row.reason,
        auction_id: row.auction_id,
        bid_id: row.bid_id,
        user_id: row.user_id,
        bid_time: row.bid_time,
      });
    }
    return groups;
  }, [allRows]);

  return (
    <div className="p-2 bg-white shadow-sm border border-gray-100 min-h-[60vh]">
      <div className="flex justify-end mb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, link..."
            className="border border-gray-200 bg-white pl-10 pr-4 py-2 rounded-lg w-72 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 duration-150 transition outline-none"
          />
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center text-sm text-gray-400 py-8">
            Đang tải dữ liệu...
          </div>
        ) : (
          groupedRows.map((item) => (
            <ProductCard key={item.key} item={item} refreshData={refetch} />
          ))
        )}
      </div>

      <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-8">
        <div className="text-gray-500 text-sm pl-1">
          {/* For future: show pagination info */}
        </div>

        <Pagination
          current={
            data?.data?.current_page != null ? data.data.current_page + 1 : 1
          }
          pageSize={data?.data?.page_size}
          total={data?.data?.total_items}
          onChange={(page) => setCurrentPage(page - 1)}
          size="small"
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};
