import React, { useState } from "react";
import { Button, Tooltip, Table, Input, Pagination } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
interface CustomerLink {
  product: string;
  bid: number;
  status: string;
  reason?: string;
}

interface Customer {
  name: string;
  vip: string;
  slots: { used: number; total: number };
  violations: { count: number; max: number };
  active: boolean;
  links: CustomerLink[];
}
const customers: Customer[] = [
  {
    name: "Nguyễn Văn A",
    vip: "VIP1",
    slots: { used: 1, total: 2 },
    violations: { count: 0, max: 3 },
    active: true,
    links: [
      { product: "Nintendo Switch OLED", bid: 52000, status: "Chờ duyệt" },
      { product: "Leica M6 Camera", bid: 95000, status: "Đã đặt" },
    ],
  },
  {
    name: "Trần Thị B",
    vip: "VIP2",
    slots: { used: 48, total: 50 },
    violations: { count: 0, max: 3 },
    active: true,
    links: [
      { product: "Leica M6 Camera", bid: 90000, status: "Đã đặt" },
      { product: "Nintendo Switch OLED", bid: 55000, status: "Đã đặt" },
      { product: "Canon R5", bid: 120000, status: "Chờ duyệt" },
    ],
  },
  {
    name: "Phạm Văn D",
    vip: "VIP2",
    slots: { used: 50, total: 50 },
    violations: { count: 3, max: 3 },
    active: false,
    links: [
      { product: "Leica M6 Camera", bid: 88000, status: "Từ chối", reason: "Còn <15s" },
    ],
  },
];

const StatusTag = ({ text, type }) => {
  let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
  if (type === "warning") colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (type === "info") colorClass = "bg-blue-100 text-blue-800 border-blue-200";
  if (type === "error") colorClass = "bg-red-100 text-red-800 border-red-200";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
      {text}
    </span>
  );
};

const formatBid = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

const LinkTableComponent = ({ links, active }: { links: CustomerLink[], active: boolean }) => {
  const columns = [
    {
      title: <span className="text-xs font-medium text-gray-500">Link</span>,
      dataIndex: "product",
      key: "product",
      width: 150,
      render: (text: string) => (
        <div>
          <div className="font-medium text-sm">{text}</div>
          <div className="text-xs text-blue-600">n98765432</div>
        </div>
      ),
    },
    {
      title: <span className="text-xs font-medium text-gray-500">Bid</span>,
      dataIndex: "bid",
      key: "bid",
      width: 100,
      render: (val: number) => <span className="text-green-600 font-semibold text-sm">{formatBid(val)}</span>,
    },
    {
      title: <span className="text-xs font-medium text-gray-500">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        if (status === "Đã đặt") return <StatusTag text="Đã đặt" type="info" />;
        if (status === "Chờ duyệt") return <StatusTag text="Chờ duyệt" type="warning" />;
        if (status === "Từ chối") return <StatusTag text="Từ chối" type="error" />;
        return <StatusTag text={status} />;
      },
    },
    {
      title: <span className="text-xs font-medium text-gray-500">Lý do</span>,
      dataIndex: "reason",
      key: "reason",
      width: 100,
      render: (reason: string | undefined) =>
        reason ? (
          <span className="text-red-500 text-sm">{reason}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: <span className="text-xs font-medium text-gray-500">Thao tác</span>,
      key: "actions",
      align: "right" as const,
      width: 150,
      render: (_: any, record: CustomerLink) => (
        <div className="flex items-center justify-end gap-2 pr-2">
          {record.status === "Chờ duyệt" && active && (
            <>
              <Button
                size="small"
                className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 text-white rounded-lg px-2 h-7 font-semibold text-xs"
              >
                Xác nhận
              </Button>
              <Button
                size="small"
                danger
                className="rounded-lg px-2 h-7 font-semibold text-xs"
              >
                Từ chối
              </Button>
            </>
          )}
          <Tooltip title="Làm mới trạng thái">
            <Button
              size="small"
              shape="circle"
              icon={<ReloadOutlined />}
              className="border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const rowClassName = (record: CustomerLink) => {
    if (record.status === "Chờ duyệt") return "bg-yellow-50/70";
    if (record.status === "Từ chối") return "bg-red-50/70";
    return "";
  };

  return (
    <div className="rounded-xl ">
      <Table
        dataSource={links.map((link, index) => ({ ...link, key: index.toString() }))}
        columns={columns}
        pagination={false}
        rowKey="key"
        showHeader
        size="middle"
        className="custom-customer-table !border-none"
        rowClassName={rowClassName}
        style={{ border: 'none' }}
      />
    </div>
  );
};
LinkTableComponent.displayName = "LinkTable";
const LinkTable = React.memo(LinkTableComponent);

const CustomerCard = ({ customer }: { customer: Customer }) => {
  const avatarText = customer.name.split(" ").map(w => w[0]).join('');
  const violationMessage = !customer.active && customer.violations.count === customer.violations.max
    ? `Không thể tạo phiên đấu giá mới do vi phạm quá số lần cho phép.`
    : null;

  return (
    <div className={`bg-white rounded-2xl  border border-gray-100 ${!customer.active ? 'border-red-400/50' : 'hover:shadow-lg'} duration-200`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ${customer.active ? 'bg-blue-500' : 'bg-red-400'}`}>
            {avatarText}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-bold text-lg text-gray-900 truncate">{customer.name}</div>
            <div className="text-xs text-gray-500 truncate">
              {customer.vip} • {customer.slots.used}/{customer.slots.total} slot • {customer.violations.count}/{customer.violations.max} vi phạm
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          {customer.active ? (
            <span className="text-green-600 text-sm font-semibold">Hoạt động</span>
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
      <LinkTable links={customer.links} active={customer.active} />
    </div>
  );
};

export const TabCustomer = () => {
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const customersToRender = customers;
  const totalCustomers = customers.length;
  const totalPages = Math.ceil(totalCustomers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedCustomers = customers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-start mb-4">
        <Input
          placeholder="Tìm kiếm khách hàng..."
          prefix={<SearchOutlined />}
          className="w-80 h-10 rounded-lg"
        />
      </div>
      <div className="space-y-7">
        {pagedCustomers.map((customer, index) => (
          <CustomerCard key={index} customer={customer} />
        ))}
      </div>
      {totalCustomers > pageSize && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-6">
          <div className="text-gray-500 text-sm">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, totalCustomers)} / <b>{totalCustomers} khách hàng</b>
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCustomers}
            onChange={setCurrentPage}
            showSizeChanger={false}
            className="flex items-center"
            itemRender={(current, type, originalElement) => {
              if (type === 'prev') return <span className="font-semibold">Trước</span>;
              if (type === 'next') return <span className="font-semibold">Sau</span>;
              return originalElement;
            }}
          />
        </div>
      )}
    </div>
  );
};