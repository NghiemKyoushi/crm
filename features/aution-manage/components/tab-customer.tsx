import React, { useState } from "react";
import { Button, Tooltip, Table, Input, Pagination, Avatar } from "antd";
import { CheckOutlined, CloseOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";

interface LinkItem {
  auction_id: number;
  title: string;
  url: string;
  bid_amount: number;
  status: string;
  reason: string;
  created_at: string;
}

interface CustomerItem {
  user_id: number;
  full_name: string;
  avatar: string;
  vip_level: string;
  slot_used: number;
  slot_total: number;
  violation_count: number;
  links: {
    data: LinkItem[];
    total_pages: number;
    total_items: number;
    current_page: number;
    page_size: number;
  };
}

interface ApiResponse {
  success: boolean;
  timestamp: string;
  code: number;
  message: string;
  message_key: string;
  data: {
    data: CustomerItem[];
    total_pages: number;
    total_items: number;
    current_page: number;
    page_size: number;
  };
  errors: null;
}

// Fake API response
const fakeApiResponse: ApiResponse = {
  success: true,
  timestamp: "2024-05-11T10:00:00Z",
  code: 0,
  message: "Thành công",
  message_key: "success",
  data: {
    data: [
      {
        user_id: 1,
        full_name: "Nguyễn Văn A77777",
        avatar: "",
        vip_level: "VIP1",
        slot_used: 1,
        slot_total: 2,
        violation_count: 0,
        links: {
          data: [
            {
              auction_id: 101,
              title: "Nintendo Switch OLED",
              url: "https://auctionsite.com/item/101",
              bid_amount: 52000,
              status: "Chờ duyệt",
              reason: "",
              created_at: "2024-05-10 14:00:00"
            },
            {
              auction_id: 102,
              title: "Leica M6 Camera",
              url: "https://auctionsite.com/item/102",
              bid_amount: 95000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-05-09 11:30:00"
            }
          ],
          total_pages: 1,
          total_items: 2,
          current_page: 1,
          page_size: 10
        }
      },
      {
        user_id: 2,
        full_name: "Trần Thị B",
        avatar: "",
        vip_level: "VIP2",
        slot_used: 48,
        slot_total: 50,
        violation_count: 0,
        links: {
          data: [
            {
              auction_id: 103,
              title: "Leica M6 Camera",
              url: "https://auctionsite.com/item/103",
              bid_amount: 90000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-05-06 16:06:00"
            },
            {
              auction_id: 104,
              title: "Nintendo Switch OLED",
              url: "https://auctionsite.com/item/104",
              bid_amount: 55000,
              status: "Đã đặt",
              reason: "",
              created_at: "2024-05-06 18:21:00"
            },
            {
              auction_id: 105,
              title: "Canon R5",
              url: "https://auctionsite.com/item/105",
              bid_amount: 120000,
              status: "Chờ duyệt",
              reason: "",
              created_at: "2024-05-07 07:50:00"
            }
          ],
          total_pages: 1,
          total_items: 3,
          current_page: 1,
          page_size: 10
        }
      },
      {
        user_id: 3,
        full_name: "Phạm Văn D",
        avatar: "",
        vip_level: "VIP2",
        slot_used: 50,
        slot_total: 50,
        violation_count: 3,
        links: {
          data: [
            {
              auction_id: 110,
              title: "Leica M6 Camera",
              url: "https://auctionsite.com/item/110",
              bid_amount: 88000,
              status: "Từ chối",
              reason: "Còn <15s",
              created_at: "2024-05-08 09:15:00"
            }
          ],
          total_pages: 1,
          total_items: 1,
          current_page: 1,
          page_size: 10
        }
      }
    ],
    total_pages: 1,
    total_items: 3,
    current_page: 1,
    page_size: 10
  },
  errors: null
};

const StatusTag: React.FC<{ text: string; type?: "warning" | "info" | "error" }> = ({ text, type }) => {
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

const LinkTable: React.FC<{
  links: LinkItem[];
  active: boolean;
}> = ({ links, active }) => {
  const columns = [
    {
      title: <span className="text-xs font-medium text-gray-500">Link</span>,
      dataIndex: "title",
      key: "title",
      width: 180,
      render: (text: string, record: LinkItem) => (
        <div>
          <div className="font-medium text-sm truncate">{text}</div>
          <div className="text-xs text-blue-600 truncate">
            {record?.auction_id ? `n${record.auction_id}` : ""}
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-xs font-medium text-gray-500">Bid</span>,
      dataIndex: "bid_amount",
      key: "bid_amount",
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
      render: (_: any, record: LinkItem) => (
        <div className="flex items-center justify-end gap-1.5">
          {record.status === "Chờ duyệt" && active && (
            <>
              <Tooltip title="Xác nhận đặt bid">
                <Button
                  size="small"
                  type="default"
                  shape="round"
                  // onClick={() => onAccept(record)}
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
                  // onClick={() => onReject(record)}
                  className="!bg-red-50 hover:!bg-red-100 !border-red-100 text-red-500 transition flex items-center gap-1 px-2"
                >
                  <span className="text-xs">Từ&nbsp;chối</span>
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title="Làm mới trạng thái">
            <Button
              size="small"
              type="default"
              shape="round"
              // onClick={() => onRefreshStatus(record)}
              className="!border-gray-200 !bg-white hover:!bg-gray-50 text-gray-400 transition px-3"
            >
              <span className="text-xs">bom</span>
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const rowClassName = (record: LinkItem) => {
    if (record.status === "Chờ duyệt") return "bg-yellow-50/70";
    if (record.status === "Từ chối") return "bg-red-50/70";
    return "";
  };

  return (
    <div className="rounded-xl">
      <Table
        dataSource={(links || []).map((link, index) => ({ ...link, key: index.toString() }))}
        columns={columns}
        pagination={false}
        rowKey="key"
        showHeader
        size="middle"
        className="custom-customer-table !border-none"
        rowClassName={rowClassName}
        style={{ border: "none" }}
      />
    </div>
  );
};

const CustomerCard: React.FC<{ customer: CustomerItem }> = ({ customer }) => {
  // Determine if user is locked: violation_count >= slot_total => blocked
  const isBlocked = customer.violation_count >= 3 || customer.slot_used >= customer.slot_total && customer.violation_count === 3;
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
              backgroundColor: active ? "#3b82f6" : "#f87171", // fallback tailwind color
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
              {customer.vip_level} • {customer.slot_used}/{customer.slot_total} slot • {customer.violation_count}/3 vi phạm
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          {active ? (
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
      <LinkTable links={customer.links.data} active={active} />
    </div>
  );
};

export const TabCustomer: React.FC = () => {
  const { data: apiData } = fakeApiResponse;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = apiData.page_size || 5;

  // paginated customers
  const totalCustomers = apiData.total_items || apiData.data.length;
  const totalPages = apiData.total_pages || 1;

  // Get correct page slice (simulate pagination)
  const customers = apiData.data.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  return (
    <div className="p-4 bg-white border border-gray-100">
      <div className="flex justify-start mb-4">
        <Input
          placeholder="Tìm kiếm khách hàng..."
          prefix={<SearchOutlined />}
          className="w-80 h-10 rounded-lg"
        />
      </div>
      <div className="space-y-7">
        {customers.map((customer) => (
          <CustomerCard key={customer.user_id} customer={customer} />
        ))}
      </div>
      {totalCustomers > pageSize && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-6">
          <div className="text-gray-500 text-sm">
            Hiển thị {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCustomers)} / <b>{totalCustomers} khách hàng</b>
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCustomers}
            onChange={setCurrentPage}
            showSizeChanger={false}
            className="flex items-center"
            itemRender={(current, type, originalElement) => {
              if (type === "prev") return <span className="font-semibold">Trước</span>;
              if (type === "next") return <span className="font-semibold">Sau</span>;
              return originalElement;
            }}
          />
        </div>
      )}
    </div>
  );
};