"use client";
import React from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { TruckOutlined } from "@ant-design/icons";

interface TrackingModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  orderCode: string;
  customerName: string;
}

const TrackingModal: React.FC<TrackingModalProps> = ({
  open,
  onCancel,
  onSubmit,
  orderCode,
  customerName,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title="Thêm mã tracking"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 rounded p-3 mb-2">
        <p className="font-semibold text-blue-900 !mb-1">Thông tin đơn hàng</p>
        <p className="!mb-1">
          <span className="font-semibold">Mã đơn:</span> {orderCode}
        </p>
        <p className="!mb-1">
          <span className="font-semibold">Khách hàng:</span> {customerName}
        </p>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{}}
        className="!mb-2"

      >
        {/* Mã tracking */}
        <Form.Item
          label="Mã tracking (tùy chọn)"
          name="trackingCode"
          rules={[
            {
              pattern: /^[A-Za-z0-9-]*$/,
              message: "Mã tracking không hợp lệ",
            },
          ]}
          className="!mb-2"
        >
          <Input className="!h-11" placeholder="VD: 1234567890123" />
        </Form.Item>

        {/* Nhà vận chuyển */}
        <Form.Item
        className="!mb-2"

          label="Nhà vận chuyển"
          name="carrier"
          rules={[{ required: true, message: "Vui lòng chọn nhà vận chuyển" }]}
        >
          <Select className="!h-11" placeholder="-- Chọn nhà vận chuyển --">
            <Select.Option value="ghn">Giao Hàng Nhanh</Select.Option>
            <Select.Option value="ghtk">Giao Hàng Tiết Kiệm</Select.Option>
            <Select.Option value="vtpost">Viettel Post</Select.Option>
            <Select.Option value="vnpost">VNPost</Select.Option>
          </Select>
        </Form.Item>

        {/* Ghi chú */}
        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea
            placeholder="Ghi chú về việc vận chuyển..."
            rows={3}
          />
        </Form.Item>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-purple-600 hover:bg-purple-700"
            icon={<TruckOutlined />}
          >
            Cập nhật tracking
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TrackingModal;
