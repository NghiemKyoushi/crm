"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, InputNumber } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getListProductCategory } from "@/features/fee-settting/apis/fee-setting";
import { Invoice } from "@/types/orderhub";

const { Option } = Select;

interface ApproveOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValuesApprove) => void;
  orderCode: string;
  customerName: string;
  orderDetail: Invoice;
}

export interface FormValuesApprove {
  description: string;
  product_category_id: number;
  cod_shipping_price: number;
  cod_type: number;
}

const ApproveOrderModal: React.FC<ApproveOrderModalProps> = ({
  open,
  onCancel,
  onSubmit,
  orderCode,
  customerName,
  orderDetail,
}) => {
  const [form] = Form.useForm();
  const [paymentType, setPaymentType] = useState<number | null>(null);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
      setPaymentType(null);
    } catch (error) {
      // antd tự highlight field lỗi
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["productCategories"],
    queryFn: getListProductCategory,
  });

  useEffect(() => {
    if (orderDetail) {
      const codeType = orderDetail.metadata?.infos?.codeType ?? null;
      const codInJapan = orderDetail.metadata?.infos?.codInJapan ?? null;
      setPaymentType(codeType);
      form.setFieldsValue({
        cod_type: codeType ?? 1,
        cod_shipping_price: codInJapan ?? null,
        product_category_id:
          orderDetail.metadata.infos?.productCategory?.id ?? null,
      });
    }
  }, [orderDetail]);

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
          <strong>Mã đơn:</strong> {orderCode || ""}
        </p>
        <p className="!mb-1">
          <strong>Khách hàng:</strong> {customerName || ""}
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
            {categories &&
              categories?.map((cat: any) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        {/* Phí vận chuyển nội địa */}
        <Form.Item
          name="cod_type"
          label="Phí vận chuyển nội địa"
          rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
          className="!mb-3"
        >
          <Select
            placeholder="Chọn hình thức"
            className="!w-full !h-11"
            onChange={(val) => setPaymentType(val)}
            options={[
              { label: "Miễn phí", value: 1 },
              { label: "Có phí", value: 2 },
              { label: "Cập nhật sau", value: 3 },
            ]}
          />
        </Form.Item>

        {paymentType === 2 && (
          <Form.Item
            name="cod_shipping_price"
            label="Số tiền thanh toán"
            className="!mb-3"
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
            icon={<CheckOutlined />}
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
