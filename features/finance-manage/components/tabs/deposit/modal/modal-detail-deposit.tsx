"use client";
import { Modal, Descriptions } from "antd";
import { DepositItem } from "@/types/deposit-type";
import dayjs from "dayjs";

type Props = {
  open: boolean;
  onClose: () => void;
  record?: DepositItem | null;
};

const DepositDetailModal = ({ open, onClose, record }: Props) => {
  if (!record) return null;

  return (
    <Modal
      title={`Chi tiết giao dịch - ${record.deposit_code}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã giao dịch">
          {record.deposit_code}
        </Descriptions.Item>
        <Descriptions.Item label="Người dùng">
          {record.user_name} (ID: {record.user_id})
        </Descriptions.Item>
        <Descriptions.Item label="Số tiền">
          {record.amount_vnd.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {record.status}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          {record.note || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Người xử lý">
          {record.handler || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {record.created_at
            ? dayjs(record.created_at).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày xử lý">
          {record.handler_time
            ? dayjs(record.handler_time).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default DepositDetailModal;
