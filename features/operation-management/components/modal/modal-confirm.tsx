"use client";
import React from "react";
import { Modal, Form, Input, Button, Radio, InputNumber } from "antd";
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
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mã shipping!"
            },
          ]}
          className="!mb-2"
        >
          <Input className="!h-11" placeholder="" />
        </Form.Item>
        <Form.Item
          label="Shipping giá"
          name="shipping_fee"
          rules={[
            {
              required: true,
              pattern: /^[A-Za-z0-9-]*$/,
              message: "Mã tracking không hợp lệ",
            },
          ]}
          className="!mb-2"
        >
          <Input className="!h-11" placeholder="" />
        </Form.Item>
        {/* 3 tùy chọn phí vận chuyển */}
        <Form.Item
          name="shipping_option"
          label="Hình thức phí vận chuyển"
          rules={[{ required: true, message: "Vui lòng chọn hình thức!" }]}
        >
          <Radio.Group className="!flex !flex-col gap-2">
            <Radio value="CUSTOMER_PAY">Khách hàng tự trả phí vận chuyển</Radio>
            <Radio value="COD">Admin điền phí COD</Radio>
            <Radio value="FREE">Miễn phí vận chuyển</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Input phí COD chỉ hiện khi chọn option 2 */}
        <Form.Item
          shouldUpdate={(prev, cur) =>
            prev.shipping_option !== cur.shipping_option
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("shipping_option") === "COD" ? (
              <Form.Item
                name="cod_fee"
                label="Phí COD"
                rules={[{ required: true, message: "Vui lòng nhập phí COD!" }]}
              >
                <InputNumber
                  className="!w-full !h-11"
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: any) => value.replace(/[^\d.]/g, "")}
                  placeholder="Nhập phí COD"
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>
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
