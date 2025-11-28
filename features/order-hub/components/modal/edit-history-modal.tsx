import React, { useEffect, useState } from "react";
import { Modal, Tag } from "antd";
import { getOrderHistory } from "@/features/order-hub/apis/orderhub";
import TableComponent from "@/components/TableComponent";
const statusConfig: Record<
  string,
  { color: string; label: string }
> = {
  PENDING_APPROVAL: { color: "orange", label: "Chờ duyệt" },
  PENDING: { color: "orange", label: "Chờ quản trị duyệt" },
  CLIENT_PENDING: { color: "orange", label: "Chờ khách duyệt" },
  PENDING_DEPOSIT: { color: "gold", label: "Chờ đặt cọc" },
  DEPOSIT_PAID: { color: "green", label: "Đã đặt cọc" },
  PURCHASED: { color: "blue", label: "Đã mua hàng" },
  ARRIVED_JP_WAREHOUSE: { color: "purple", label: "Đã về kho Nhật" },
  ARRIVED_VN_WAREHOUSE: { color: "cyan", label: "Đã về kho VN" },
  UNDER_INSPECTION: { color: "lime", label: "Kiểm hàng" },
  PENDING_PAYMENT: { color: "red", label: "Chờ thanh toán" },
  READY_TO_SHIP: { color: "geekblue", label: "Sẵn sàng giao" },
  SHIPPED: { color: "volcano", label: "Đã giao hàng" },
  SHIPPING_REQUEST_CLIENT: { color: "magenta", label: "Yêu cầu giao hàng" },
  CANCELED: { color: "red", label: "Đã hủy" },
  DENIED: { color: "red", label: "Đã bị từ chối" },
  PACKED: { color: "green", label: "Đã đóng gói" }
  // default case handled below
};

interface EditHistoryModalProps {
  isOpen: boolean;
  onCancel: () => void;
  orderId: number | undefined;
}

interface OrderHistoryItem {
  status: string;
  description?: string;
  [key: string]: any; // để tránh lỗi khi api trả về extra fields
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({
  isOpen,
  onCancel,
  orderId,
}) => {
  const [data, setData] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId && isOpen) {
      setLoading(true);
      getOrderHistory(orderId)
        .then((res) => {
          setData(res || []);
        })
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }
  }, [orderId, isOpen]);

  const columns = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status: string) => {
        const config = statusConfig[status];
        if (config) {
          return config.label;
        }
        return status;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      title="Lịch sử đơn hàng"
      footer={null}
      width={540}
      destroyOnClose
      centered
      bodyStyle={{ minHeight: 400, overflowY: 'auto' }}
    >
      <TableComponent
        columns={columns}
        dataSource={data}
        pagination={false}
        loading={loading}
        bordered
        size="middle"
        response={undefined}
        page={0}
        onPageChange={() => {}}
      />
    </Modal>
  );
};

export default EditHistoryModal;
