"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Radio, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface ApproveOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  orderCode: string;
  customerName: string;
}

interface FormValues {
  productType: string;
  codFee: string;
  adminNote?: string;
}

const ApproveOrderModal: React.FC<ApproveOrderModalProps> = ({
  open,
  onCancel,
  onSubmit,
  orderCode,
  customerName,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      // nếu có lỗi validate thì antd sẽ highlight input
    }
  };

  return (
    <Modal
      title="Duyệt đơn hàng"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 p-3 rounded mb-2">
        <h4 className="font-semibold text-blue-900 mb-2">Thông tin đơn hàng</h4>
        <p>
          <strong>Mã đơn:</strong> {orderCode}
        </p>
        <p>
          <strong>Khách hàng:</strong> {customerName}
        </p>
      </div>

      <Form layout="vertical" form={form}>
        {/* Loại sản phẩm */}
        <Form.Item
          name="productType"
          label="Loại sản phẩm"
          rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm!" }]}
          className="!mb-3"
        >
          <Select placeholder="-- Chọn loại sản phẩm --">
            <Select.Option value="A">Sản phẩm A</Select.Option>
            <Select.Option value="B">Sản phẩm B</Select.Option>
          </Select>
        </Form.Item>

        {/* Phí COD */}
        <Form.Item
          name="codFee"
          label="Phí COD"
          rules={[{ required: true, message: "Vui lòng chọn phí COD!" }]}
          className="!mb-3"
        >
          <Radio.Group className="!flex !flex-col !gap-2">
            <Radio value="FIXED">Điền phí cố định</Radio>
            <Radio value="LATER">Đợi tính phí sau</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Ghi chú admin */}
        <Form.Item name="adminNote" label="Ghi chú admin">
          <Input.TextArea className="!h-25" placeholder="Ghi chú về việc duyệt đơn..." />
        </Form.Item>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            className="!bg-green-600"
            icon={<FontAwesomeIcon icon={faCheck} />}
            onClick={handleOk}
          >
            Duyệt đơn
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ApproveOrderModal;
