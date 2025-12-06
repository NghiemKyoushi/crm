// src/components/BidDecisionModal.tsx
import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { LinkItem } from "../tab-customer";

export type BidStatus = "Chờ duyệt" | "Đã đặt" | "";

export type DecisionMode = "accept" | "reject" | "finish" | "cancel";


type BidDecisionModalProps = {
  mode: DecisionMode;
  open: boolean;
  bid: null | LinkItem;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  onCancel: () => void;
  onConfirm: (payload: { reason?: string }) => Promise<void> | void;
};

export const BidDecisionCusModal: React.FC<BidDecisionModalProps> = ({
  mode,
  open,
  bid,
  okText,
  cancelText = "Hủy",
  confirmLoading = false,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const isReject = mode === "reject";
  const defaultOkText = isReject ? "Xác nhận từ chối" : "Chấp nhận";

  const handleOk = async () => {
    if (isReject) {
      try {
        const values = await form.validateFields();
        await onConfirm({ reason: values.reason });
      } catch {}
    } else {
      await onConfirm({});
    }
  };

  return (
    <Modal
      title={
        <div className="font-semibold">
          {isReject
            ? `Từ chối bid${bid ? ` - ${bid.title}` : ""}`
            : `Xác nhận đặt bid${bid ? ` - ${bid.title}` : ""}`}
        </div>
      }
      open={open}
      onCancel={onCancel}
      okText={okText ?? defaultOkText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      destroyOnClose
    >
      {isReject ? (
        <Form form={form} layout="vertical" initialValues={{ reason: "" }}>
          <Form.Item
            label="Lý do từ chối"
            name="reason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do từ chối." },
              { min: 5, message: "Lý do nên có ít nhất 5 ký tự." },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do từ chối (ví dụ: không đáp ứng yêu cầu, giá chưa phù hợp...)"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      ) : (
        <div className="text-sm text-gray-700">
          Bạn có chắc muốn <b>chấp nhận</b> bid của{" "}
          <b>{bid?.title ?? "khách hàng"}</b> với số tiền{" "}
          <b>
            {bid?.bid_amount?.toLocaleString("ja-JP", {
              style: "currency",
              currency: "JPY",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </b>
          ?
        </div>
      )}
    </Modal>
  );
};
