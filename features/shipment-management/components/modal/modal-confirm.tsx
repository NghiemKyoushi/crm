"use client";
import React, { useState } from "react";
import { Modal, Form, Input, Button, Radio, InputNumber, Select } from "antd";
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
  const [paymentType, setPaymentType] = useState(1);

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
          <span className="font-semibold">Mã vận đơn:</span> {orderCode}
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
          label="Mã tracking"
          name="shipping_code"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mã tracking!",
            },
          ]}
          className="!mb-2"
        >
          <Input className="!h-11" placeholder="" />
        </Form.Item>
        {/* 3 tùy chọn phí vận chuyển */}
        <Form.Item
          label="Cước vc nội địa"
          name="shipping_type"
          className="!mb-1 "
          rules={[
            {
              required: true,
              message: "Vui lòng chọn hình thức thanh toán",
            },
          ]}
        >
          <Select
            placeholder="Chọn hình thức"
            onChange={(value) => setPaymentType(value)}
            options={[
              { label: "Miễn phí", value: 1 },
              { label: "Có phí", value: 2 },
              { label: "Khách hàng trả", value: 4 },
            ]}
            className="!w-full !h-11"
          />
        </Form.Item>
        {paymentType === 2 && (
          <Form.Item
            label="Số tiền thanh toán"
            name="shipping_fee"
            className="!mb-1"
            rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
          >
            <InputNumber
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/,/g, "") as any}
              className="!w-full !h-11"
              min={0}
            />
          </Form.Item>
        )}
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-purple-600 hover:bg-purple-700"
            icon={<TruckOutlined />}
          >
            Cập nhật
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TrackingModalShip;
