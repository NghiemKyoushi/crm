import React, { useState, useMemo } from "react";
import { Button, Tooltip, Pagination, Table } from "antd";
import {
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  LinkOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { BidDecisionModal, DecisionMode } from "./modal/accept-modal";
import { toast } from "react-toastify";

// Fake data based on provided type:
const fakeApiResponse = {
  success: true,
  timestamp: "2024-06-15T10:00:00Z",
  code: 0,
  message: "string",
  message_key: "string",
  data: {
    data: [
      {
        auction_id: 1,
        title: "Nintendo Switch OLED 333333",
        url: "page.auctions.yahoo.co.jp/n98765432",
        thumbnail: "",
        end_time: "2024-12-02 15:30:00",
        customers: {
          data: [
            {
              user_id: 101,
              full_name: "Nguyễn Văn A",
              vip_level: "VIP1",
              bid_amount: 52000,
              status: "Chờ duyệt",
              reason: "",
              created_at: "2024-12-01 09:00:00",
            },
            {
              user_id: 102,
              full_name: "Trần Thị B",
              vip_level: "VIP2",
              bid_amount: 55000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-12-02 10:00:00",
            },
          ],
          total_pages: 1,
          total_items: 2,
          current_page: 1,
          page_size: 10,
        },
      },
      {
        auction_id: 2,
        title: "Leica M6 Camera",
        url: "page.auctions.yahoo.co.jp/x12345678",
        thumbnail: "",
        end_time: "2024-12-03 10:00:00",
        customers: {
          data: [
            {
              user_id: 103,
              full_name: "Lê Văn C",
              vip_level: "VIP2",
              bid_amount: 90000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-12-02 12:01:00",
            },
            {
              user_id: 104,
              full_name: "Phạm Văn D",
              vip_level: "VIP1",
              bid_amount: 88000,
              status: "Từ chối",
              reason: "Còn <15s",
              created_at: "2024-12-02 12:02:00",
            },
            {
              user_id: 105,
              full_name: "Hoàng E",
              vip_level: "VIP3",
              bid_amount: 95000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-12-02 12:03:00",
            },
          ],
          total_pages: 1,
          total_items: 3,
          current_page: 1,
          page_size: 10,
        },
      },
      {
        auction_id: 3,
        title: "Apple Watch Series 9",
        url: "page.auctions.yahoo.co.jp/z98765432",
        thumbnail: "",
        end_time: "2024-12-04 12:00:00",
        customers: {
          data: [
            {
              user_id: 106,
              full_name: "Phạm F",
              vip_level: "VIP1",
              bid_amount: 60000,
              status: "Chờ duyệt",
              reason: "",
              created_at: "2024-12-03 08:00:00",
            },
            {
              user_id: 107,
              full_name: "Nguyễn G",
              vip_level: "VIP2",
              bid_amount: 62000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-12-04 08:00:00",
            },
          ],
          total_pages: 1,
          total_items: 2,
          current_page: 1,
          page_size: 10,
        },
      },
      {
        auction_id: 4,
        title: "Canon EOS R5",
        url: "page.auctions.yahoo.co.jp/c11223344",
        thumbnail: "",
        end_time: "2024-12-05 18:00:00",
        customers: {
          data: [
            {
              user_id: 108,
              full_name: "Trần H",
              vip_level: "VIP2",
              bid_amount: 150000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-12-05 09:00:00",
            },
          ],
          total_pages: 1,
          total_items: 1,
          current_page: 1,
          page_size: 10,
        },
      },
    ],
    total_pages: 1,
    total_items: 4,
    current_page: 1,
    page_size: 10,
  },
  errors: null,
};

interface StatusTagProps {
  text: string;
  type: "warning" | "info" | "error" | "default";
}

const StatusTag: React.FC<StatusTagProps> = ({ text, type }) => {
  let colorClass = "bg-gray-50 text-gray-700 border-gray-200";
  if (type === "warning")
    colorClass = "bg-yellow-50 text-yellow-800 border-yellow-200";
  if (type === "info") colorClass = "bg-blue-50 text-blue-700 border-blue-200";
  if (type === "error") colorClass = "bg-red-50 text-red-700 border-red-100";
  return (
    <span
      className={`px-3 py-0.5 rounded-2xl text-xs font-semibold border ${colorClass} transition-colors duration-200`}
    >
      {text}
    </span>
  );
};

type FlatRow = {
  key: string;
  auctionId: number;
  title: string;
  url: string;
  end_time: string;
  thumbnail: string;
  full_name: string;
  vip_level: string;
  bid_amount: number;
  status: string;
  reason: string;
  isGroupStart: boolean;
  id?: number;
};

export type BidItem = Omit<
  FlatRow,
  "title" | "url" | "thumbnail" | "end_time" | "auctionId" | "isGroupStart"
>;

type GroupedRow = {
  auctionId: number;
  title: string;
  url: string;
  end_time: string;
  thumbnail: string;
  bids: BidItem[];
  isGroupStart: boolean;
  key: string;
};

function flattenBids(data: typeof fakeApiResponse.data.data): FlatRow[] {
  const result: FlatRow[] = [];
  data.forEach((auctionItem) => {
    auctionItem.customers.data.forEach((customer, idx) => {
      result.push({
        key: `${auctionItem.auction_id}-${customer.user_id}`,
        auctionId: auctionItem.auction_id,
        title: auctionItem.title,
        url: auctionItem.url,
        end_time: auctionItem.end_time,
        thumbnail: auctionItem.thumbnail,
        full_name: customer.full_name,
        vip_level: customer.vip_level,
        bid_amount: customer.bid_amount,
        status: customer.status,
        reason: customer.reason || "",
        isGroupStart: idx === 0,
      });
    });
  });
  return result;
}

const ProductCard = ({ item }: { item: GroupedRow }) => {
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
      width: 95,
      align: "center" as const,
      render: (status: string) => {
        if (status === "Chờ duyệt")
          return <StatusTag text="Chờ duyệt" type="warning" />;
        if (status === "Đã đặt") return <StatusTag text="Đã đặt" type="info" />;
        if (status === "Từ chối")
          return <StatusTag text="Từ chối" type="error" />;
        return null;
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
      render: (_: any, b: BidItem) => (
        <div className="flex items-center justify-center gap-1.5">
          {b.status === "Chờ duyệt" && (
            <>
              <Tooltip title="Xác nhận đặt bid">
                <Button
                  size="small"
                  type="default"
                  shape="circle"
                  icon={<CheckOutlined />}
                  onClick={() => openModal("accept", b)}
                  className="!bg-green-50 hover:!bg-green-100 !border-green-100 text-green-600 transition"
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  size="small"
                  type="default"
                  shape="circle"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => openModal("reject", b)}
                  className="!bg-red-50 hover:!bg-red-100 !border-red-100 text-red-500 transition"
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Làm mới trạng thái">
            <Button
              size="small"
              type="default"
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={() => onRefreshStatus(b)}
              className="!border-gray-200 !bg-white hover:!bg-gray-50 text-gray-400 transition"
            />
          </Tooltip>
        </div>
      ),
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
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [tableData, setTableData] = useState<BidItem[]>(item.bids);

  const openModal = (mode: DecisionMode, bid: BidItem) => {
    setDecisionMode(mode);
    setSelectedBid(bid);
    setDecisionOpen(true);
  };

  const closeModal = () => {
    setDecisionOpen(false);
    setSelectedBid(null);
    setConfirmLoading(false);
  };

  const handleConfirm = async (payload: { reason?: string }) => {
    if (!selectedBid) return;
    try {
      setConfirmLoading(true);

      // TODO: Gọi API thực tế ở đây
      // if (decisionMode === "accept") await api.acceptBid({ id: selectedBid.id });
      // else await api.rejectBid({ id: selectedBid.id, reason: payload.reason });

      // Cập nhật local state
      // setTableData((prev) =>
      //   prev.map((b: any) =>
      //     b?.id === selectedBid?.id
      //       ? {
      //           ...b,
      //           status: decisionMode === "accept" ? "Đã đặt" : "Từ chối",
      //           reason: decisionMode === "reject" ? payload.reason ?? "" : "",
      //         }
      //       : b
      //   )
      // );

      toast.success(
        decisionMode === "accept" ? "Đã chấp nhận bid." : "Đã từ chối bid."
      );
      closeModal();
    } catch (e) {
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
        <div className="flex items-center gap-4 px-5 pt-5 pb-4 border-b border-gray-100 bg-[linear-gradient(90deg,#f5f8ff_0,#fff_30%,#fff_100%)] rounded-t-2xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-500 text-base font-bold shadow-inner">
            {item.title.split(" ")[0][0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base text-gray-900 truncate">
              {item.title}
            </div>
            <a
              href={`https://${item.url}`}
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
              {item.end_time}
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
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Flatten all bids from all auctions (for pagination by bids)
  const allRows = useMemo(() => flattenBids(fakeApiResponse.data.data), []);
  const totalBids = allRows.length;

  // Group bids for output, similar to old code
  const groupedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const pagedRows = allRows.slice(startIndex, startIndex + pageSize);

    const rowsToRender = [...pagedRows];
    if (rowsToRender.length > 0) {
      const firstRow = rowsToRender[0];
      const firstBidIndexInAll = allRows.findIndex(
        (r) => r.auctionId === firstRow.auctionId && r.isGroupStart
      );
      firstRow.isGroupStart = startIndex === firstBidIndexInAll;
    }

    const groups: GroupedRow[] = [];
    let currentGroup: GroupedRow | null = null;

    for (const row of rowsToRender) {
      const isNewGroup =
        row.isGroupStart ||
        !currentGroup ||
        currentGroup.auctionId !== row.auctionId;

      if (isNewGroup) {
        currentGroup = {
          auctionId: row.auctionId,
          title: row.title,
          url: row.url,
          end_time: row.end_time,
          thumbnail: row.thumbnail,
          bids: [],
          isGroupStart: row.isGroupStart,
          key: row.key,
        };
        groups.push(currentGroup);
      }

      currentGroup?.bids.push({
        key: row.key,
        full_name: row.full_name,
        vip_level: row.vip_level,
        bid_amount: row.bid_amount,
        status: row.status,
        reason: row.reason,
      });
    }
    return groups;
  }, [allRows, currentPage, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const actualTotalCount = totalBids;
  const actualEndIndex = Math.min(startIndex + pageSize, actualTotalCount);

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
        {groupedRows.map((item) => (
          <ProductCard key={item.key} item={item} />
        ))}
      </div>

      <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-8">
        <div className="text-gray-500 text-sm pl-1">
          <span>
            Hiển thị{" "}
            <b>
              {startIndex + 1}-{actualEndIndex}
            </b>{" "}
            / <b>{actualTotalCount} links</b>
          </span>
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={actualTotalCount}
          onChange={setCurrentPage}
          showSizeChanger={false}
          className="flex items-center gap-2"
          itemRender={(current, type, originalElement) => {
            if (type === "prev")
              return (
                <span className="font-semibold px-2 py-1 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                  Trước
                </span>
              );
            if (type === "next")
              return (
                <span className="font-semibold px-2 py-1 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                  Sau
                </span>
              );
            return originalElement;
          }}
        />
      </div>
    </div>
  );
};
