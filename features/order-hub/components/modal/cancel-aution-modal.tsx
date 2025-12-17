import React, { useState } from "react";
import { Modal, Form, Input, Button, Select } from "antd";

interface CancelAuctionModalProps {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (data: { note: string; is_admin_cancel: boolean }) => void;
}

const { Option } = Select;

const CancelAuctionModal: React.FC<CancelAuctionModalProps> = ({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onConfirm({
        note: values.reason,
        is_admin_cancel: values.is_admin_cancel,
      });
    } catch (err) {
      // Validation failed
    }
  };

  return (
    <Modal
      visible={visible}
      title="Hủy đơn đấu giá"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Huỷ bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          Xác nhận
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ is_admin_cancel: true }}
      >
        <Form.Item
          name="is_admin_cancel"
          label="Từ phía"
          rules={[{ required: true, message: "Vui lòng chọn bên huỷ đơn!" }]}
        >
          <Select>
            <Option value={true}>Admin</Option>
            <Option value={false}>Khách hàng</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="reason"
          label="Lý do hủy đơn"
          rules={[
            { required: true, message: "Vui lòng nhập lý do hủy đơn!" },
            { max: 200, message: "Lý do không được vượt quá 200 ký tự." },
          ]}
        >
          <Input.TextArea rows={3} placeholder="Nhập lý do huỷ đơn đấu giá..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CancelAuctionModal;
