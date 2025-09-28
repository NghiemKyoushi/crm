"use client";
import React from "react";
import { Modal, Form, Input, Button } from "antd";
import { TruckOutlined } from "@ant-design/icons";

interface TrackingModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  orderCode: string;
  customerName: string;
}

const TrackingModalShip: React.FC<TrackingModalProps> = ({
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
      title="Xác nhận vận chuyển"
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
        <Form.Item
          label="Mã shipping"
          name="shipping_code"
          // rules={[
          //   {
          //     pattern: /^[A-Za-z0-9-]*$/,
          //     message: "Mã tracking không hợp lệ",
          //   },
          // ]}
          className="!mb-2"
        >
          <Input className="!h-11" placeholder="VD: 1234567890123" />
        </Form.Item>
        <Form.Item
          label="Shipping giá"
          name="shipping_fee"
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

export default TrackingModalShip;
