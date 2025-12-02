import React, { useState, useMemo } from "react";
import { Button, Tooltip, Pagination, Table } from "antd";
import {
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  LinkOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const auctionData = [
  {
    id: 1,
    product: "Nintendo Switch OLED",
    url: "page.auctions.yahoo.co.jp/n98765432",
    end: "02/12 15:30",
    bids: [
      { name: "Nguyễn Văn A", vip: "VIP1", amount: "¥52,000", status: "Chờ duyệt" },
      { name: "Trần Thị B", vip: "VIP2", amount: "¥55,000", status: "Đã đặt" },
    ],
  },
  {
    id: 2,
    product: "Leica M6 Camera",
    url: "page.auctions.yahoo.co.jp/x12345678",
    end: "03/12 10:00",
    bids: [
      { name: "Lê Văn C", vip: "VIP2", amount: "¥90,000", status: "Đã đặt" },
      { name: "Phạm Văn D", vip: "VIP1", amount: "¥88,000", status: "Từ chối", reason: "Còn <15s" },
      { name: "Hoàng E", vip: "VIP3", amount: "¥95,000", status: "Đã đặt" },
    ],
  },
  {
    id: 3,
    product: "Apple Watch Series 9",
    url: "page.auctions.yahoo.co.jp/z98765432",
    end: "04/12 12:00",
    bids: [
      { name: "Phạm F", vip: "VIP1", amount: "¥60,000", status: "Chờ duyệt" },
      { name: "Nguyễn G", vip: "VIP2", amount: "¥62,000", status: "Đã đặt" },
    ],
  },
  {
    id: 4,
    product: "Canon EOS R5",
    url: "page.auctions.yahoo.co.jp/c11223344",
    end: "05/12 18:00",
    bids: [{ name: "Trần H", vip: "VIP2", amount: "¥150,000", status: "Đã đặt" }],
  },
];

const StatusTag = ({ text, type }) => {
  let colorClass =
    "bg-gray-50 text-gray-700 border-gray-200";
  if (type === "warning") colorClass = "bg-yellow-50 text-yellow-800 border-yellow-200";
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
  product: string;
  url: string;
  end: string;
  name: string;
  vip: string;
  amount: string;
  status: string;
  reason: string;
  isGroupStart: boolean;
};

type BidItem = Omit<
  FlatRow,
  "product" | "url" | "end" | "auctionId" | "isGroupStart"
>;

type GroupedRow = {
  auctionId: number;
  product: string;
  url: string;
  end: string;
  bids: BidItem[];
  isGroupStart: boolean;
  key: string;
};

function flattenBids(data: typeof auctionData): FlatRow[] {
  let result: FlatRow[] = [];
  data.forEach((item) => {
    item.bids.forEach((b, idx) => {
      result.push({
        key: `${item.id}-${idx}`,
        auctionId: item.id,
        product: item.product,
        url: item.url,
        end: item.end,
        name: b.name,
        vip: b.vip,
        amount: b.amount,
        status: b.status,
        reason: b.reason || "",
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
      dataIndex: "name",
      key: "name",
      width: 170,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <span className="font-medium whitespace-nowrap text-gray-900">{text}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 font-medium">
            {record.vip}
          </span>
        </div>
      ),
    },
    {
      title: <span className="font-medium text-xs text-gray-500">Bid</span>,
      dataIndex: "amount",
      key: "amount",
      width: 80,
      render: (text) => <span className="text-green-600 font-semibold">{text}</span>,
    },
    {
      title: <span className="font-medium text-xs text-gray-500">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      width: 95,
      align: "center" as const,
      render: (status) => {
        if (status === "Chờ duyệt")
          return <StatusTag text="Chờ duyệt" type="warning" />;
        if (status === "Đã đặt") return <StatusTag text="Đã đặt" type="info" />;
        if (status === "Từ chối") return <StatusTag text="Từ chối" type="error" />;
        return null;
      },
    },
    {
      title: <span className="font-medium text-xs text-gray-500">Lý do</span>,
      dataIndex: "reason",
      key: "reason",
      width: 120,
      render: (reason) =>
        reason ? (
          <span className="text-gray-500 text-xs">{reason}</span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      title: <span className="font-medium text-xs text-gray-500">Thao tác</span>,
      key: "actions",
      width: 112,
      align: "center" as const,
      render: (_, b: BidItem) => (
        <div className="flex items-center justify-center gap-1.5">
          {b.status === "Chờ duyệt" && (
            <>
              <Tooltip title="Xác nhận đặt bid">
                <Button
                  size="small"
                  type="default"
                  shape="circle"
                  icon={<CheckOutlined />}
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

  return (
    <div
      key={item.key}
      className="bg-white rounded-2xl border-gray-100 hover:shadow transition-shadow duration-200"
    >
      {item.isGroupStart && (
        <div className="flex items-center gap-4 px-5 pt-5 pb-4 border-b border-gray-100 bg-[linear-gradient(90deg,#f5f8ff_0,#fff_30%,#fff_100%)] rounded-t-2xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-500 text-base font-bold shadow-inner">
            {item.product.split(" ")[0][0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base text-gray-900 truncate">{item.product}</div>
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
          </div>
          <div className="flex flex-col items-end ml-2 flex-shrink-0">
            <span className="text-gray-400 text-xs tracking-tight">Kết thúc</span>
            <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-700 text-xs font-medium border border-gray-200">
              {item.end}
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
              wrapper: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
                <tbody {...props} style={{ border: "none" }} />
              ),
            },
          }}
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
};

export const TabLink = () => {
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const allRows = useMemo(() => flattenBids(auctionData), []);
  const totalBids = allRows.length;

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
        row.isGroupStart || !currentGroup || currentGroup.auctionId !== row.auctionId;

      if (isNewGroup) {
        currentGroup = {
          auctionId: row.auctionId,
          product: row.product,
          url: row.url,
          end: row.end,
          bids: [],
          isGroupStart: row.isGroupStart,
          key: row.key,
        };
        groups.push(currentGroup);
      }

      currentGroup.bids.push({
        key: row.key,
        name: row.name,
        vip: row.vip,
        amount: row.amount,
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
    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh]">
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
            Hiển thị <b>{startIndex + 1}-{actualEndIndex}</b> / <b>{actualTotalCount} links</b>
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