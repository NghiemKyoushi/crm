import { ColumnsType } from "antd/es/table";
import { Tag, Button, Space } from "antd";

export interface DepositRecord {
  id: string;
  orderCode: string;
  customer: string;
  amount: number;
  createdAt: string;
  handler: string;
  handledAt?: string;
  status: "pending" | "confirmed" | "canceled" | "manual";
}

export const getWithdrawColumns = (
  onAction: (type: string, record: DepositRecord) => void
): ColumnsType<DepositRecord> => [
  {
    title: "Mã Lệnh",
    dataIndex: "orderCode",
    key: "orderCode",
  },
  {
    title: "Khách hàng (UserID)",
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Số tiền (VND)",
    dataIndex: "amount",
    key: "amount",
    render: (value: number) =>
      value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Người xử lý",
    dataIndex: "handler",
    key: "handler",
  },
  {
    title: "Ngày xử lý",
    dataIndex: "handledAt",
    key: "handledAt",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: DepositRecord["status"]) => {
      switch (status) {
        case "pending":
          return <Tag className="!rounded-3xl" color="gold">Chờ xác nhận</Tag>;
        case "confirmed":
          return <Tag className="!rounded-3xl" color="green">Đã xác nhận</Tag>;
        case "canceled":
          return <Tag className="!rounded-3xl" color="red">Đã hủy</Tag>;
        case "manual":
          return <Tag className="!rounded-3xl" color="blue">Nạp tay</Tag>;
        default:
          return null;
      }
    },
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <Space>
        {record.status === "pending" && (
          <>
            <Button  className="!bg-green-500 !hover:bg-green-600 !text-white !px-3 !py-1 !font-medium !rounded"  type="primary" size="small" onClick={() => onAction("confirm", record)}>
              Xác nhận
            </Button>
            <Button className="!bg-red-500 !hover:bg-red-600 !text-white !px-3 !py-1 !font-medium !rounded" size="small" onClick={() => onAction("cancel", record)}>
              Hủy Lệnh
            </Button>
          </>
        )}
        {["confirmed", "canceled", "manual"].includes(record.status) && (
          <div>
            <Button type="link" size="small" onClick={() => onAction("history", record)}>
              Xem lịch sử
            </Button>
          </div>
        )}
      </Space>
    ),
  },
];
