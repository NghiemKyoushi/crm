    "use client";
import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, message } from "antd";

interface CancelReasonModalProps {
  open: boolean;
  transactionCode: string; // ví dụ: "N-0805-1"
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CancelReasonModal: React.FC<CancelReasonModalProps> = ({
  open,
  transactionCode,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      onConfirm(values.reason);
      setLoading(false);
      form.resetFields();
    } catch {
      message.error("Vui lòng nhập lý do!");
    }
  };

  return (
    <Modal
      open={open}
      title="Lý do Hủy/Từ chối"
      onCancel={onClose}
      footer={null}
      width={400}
      centered
    >
      <div className="mb-3 text-sm">
        Vui lòng nhập lý do hủy{" "}
        <Typography.Text strong className="text-blue-600">
          {transactionCode}
        </Typography.Text>
        .
      </div>

      <Form form={form} layout="vertical" className="space-y-2">
        <Form.Item
          label="Lý do"
          name="reason"
          rules={[
            { required: true, message: "Nhập lý do hủy!" },
            { min: 5, message: "Lý do phải có ít nhất 5 ký tự!" },
          ]}
        >
          <Input.TextArea
            // placeholder="l."
            rows={3}
          />
        </Form.Item>

        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={onClose}>Hủy bỏ</Button>
          <Button
            type="primary"
            danger
            loading={loading}
            onClick={handleSubmit}
          >
            Xác nhận
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CancelReasonModal;
