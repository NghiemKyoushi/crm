"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Radio, Button, InputNumber } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { getListProductCategory } from "@/features/fee-settting/apis/fee-setting";

const { Option } = Select;

interface ApproveOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValuesApprove) => void;
  orderCode: string;
  customerName: string;
}

export interface FormValuesApprove {
  cod_shipping: number;
  description: string;
  product_category_id: number;
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

  const { data: categories } = useQuery({
    queryKey: ["productCategories"],
    queryFn: getListProductCategory,
  });

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
        <h4 className="font-semibold text-blue-900 !mb-1">
          Thông tin đơn hàng
        </h4>
        <p className="!mb-1">
          <strong>Mã đơn:</strong> {orderCode}
        </p>
        <p className="!mb-1">
          <strong>Khách hàng:</strong> {customerName}
        </p>
      </div>

      <Form layout="vertical" form={form}>
        {/* Loại sản phẩm */}
        <Form.Item
          name="product_category_id"
          label="Loại sản phẩm"
          rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm!" }]}
          className="!mb-3"
        >
          <Select className="!h-11" placeholder="-- Chọn loại sản phẩm --">
            {categories?.map((cat: any) => {
              return (
                <>
                  <Option value={cat.id}>{cat.name}</Option>
                </>
              );
            })}
          </Select>
        </Form.Item>

        {/* Phí COD */}
        <Form.Item
          name="cod_shipping"
          label="Phí COD"
          rules={[{ required: true, message: "Vui lòng nhập phí COD!" }]}
          className="!mb-3"
        >
          <InputNumber
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            style={{ display: "flex", alignItems: "center" }}
            className="!w-full !h-11"
            min={0}
          />
        </Form.Item>

        {/* Ghi chú admin */}
        <Form.Item
          rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
          name="description"
          label="Ghi chú admin"
        >
          <Input.TextArea
            className="!h-25"
            placeholder="Ghi chú về việc duyệt đơn..."
          />
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
