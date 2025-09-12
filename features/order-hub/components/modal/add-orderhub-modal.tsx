import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Radio,
  Row,
  Col,
  Divider,
} from "antd";

const { Option } = Select;

interface CreateOrderModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
export default function CreateOrderModal(props: CreateOrderModalProps) {
  const { isOpen, onCancel, onConfirm } = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("✅ Form values:", values);
      form.resetFields();
    } catch (err) {
      console.log("❌ Validation failed:", err);
    }
  };

  return (
    <>
      <Modal
        styles={{
          body: {
            maxHeight: "70vh", // Giới hạn chiều cao nội dung
            overflowY: "auto", // Cho phép scroll
            paddingRight: "8px",
            overflowX: "hidden"
          },
        }}
        title="Tạo Đơn hàng cho Khách hàng"
        open={isOpen}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="bg-blue-500"
          >
            Tạo Đơn hàng
          </Button>,
        ]}
        width={800}
      >
        <Form form={form} layout="vertical" initialValues={{ method: "buy" }}>
          <Row gutter={24}>
            {/* Thông tin Sản phẩm */}
            <Col span={12}>
              <Divider orientation="left">Thông tin Sản phẩm</Divider>
              <Form.Item
                label="Link Sản phẩm"
                name="link"
                rules={[{ required: true, message: "Vui lòng nhập link!" }]}
              >
                <Input placeholder="https://..." />
              </Form.Item>

              <Form.Item
                label="Tên Sản phẩm"
                name="productName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
              >
                <Input placeholder="VD: iPhone 15 Pro Max..." />
              </Form.Item>

              <Form.Item
                label="Loại sản phẩm"
                name="category"
                rules={[{ required: true, message: "Chọn loại sản phẩm!" }]}
              >
                <Select placeholder="-- Chọn loại sản phẩm --">
                  <Option value="phone">Điện thoại</Option>
                  <Option value="laptop">Laptop</Option>
                </Select>
              </Form.Item>

              <Form.Item
  label="Phương thức"
  name="method"
  rules={[{ required: true, message: "Chọn phương thức!" }]}
>
  <Radio.Group className="flex gap-4 w-full">
    <Radio value="buy" >
      Mua thẳng
    </Radio>
    <Radio value="auction" >
      Đấu giá
    </Radio>

    <div className="grid grid-cols-2 gap-4 w-full">
      <Form.Item noStyle shouldUpdate={(prev, cur) => prev.method !== cur.method}>
        {({ getFieldValue }) => {
          const method = getFieldValue("method");
          return (
            <>
              <div
                className={`cursor-pointer rounded-xl border p-4 ${
                  method === "buy" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onClick={() => form.setFieldsValue({ method: "buy" })}
              >
                <div className="font-semibold">Mua thẳng</div>
                <div className="text-sm text-gray-500">Giá cố định</div>
              </div>
              <div
                className={`cursor-pointer rounded-xl border p-4 ${
                  method === "auction" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onClick={() => form.setFieldsValue({ method: "auction" })}
              >
                <div className="font-semibold">Đấu giá</div>
                <div className="text-sm text-gray-500">Giá linh hoạt</div>
              </div>
            </>
          );
        }}
      </Form.Item>
    </div>
  </Radio.Group>
</Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item className="!flex-1" label="Giá (¥)" name="priceY">
                  <InputNumber className="!w-full" min={0}  />
                </Form.Item>

                <Form.Item className="!flex-1" label="Giá (VND)" name="priceVnd">
                  <Input className="!w-full" disabled placeholder="Tự động tính" />
                </Form.Item>
              </div>
            </Col>

            {/* Thông tin Đơn hàng */}
            <Col span={12}>
              <Divider orientation="left">Thông tin Đơn hàng</Divider>
              <Form.Item
                label="Khách hàng"
                name="customer"
                rules={[
                  { required: true, message: "Vui lòng chọn khách hàng!" },
                ]}
              >
                <Input placeholder="Tìm khách hàng theo mã hoặc tên..." />
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item className="!flex-1" label="Phí DV (¥)" name="feeY">
                  <InputNumber className="!w-full" min={0} />
                </Form.Item>

                <Form.Item className="!flex-1" label="Phí DV (VND)" name="feeVnd">
                  <Input className="!w-full"  disabled placeholder="Tự động tính" />
                </Form.Item>
              </div>

              <div className="flex flex-row gap-1">
                <Form.Item
                  label="Tiền cọc (VND)"
                  name="deposit"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiền cọc!" },
                  ]}
                  className="!flex-1"
                >
                  <InputNumber className="!w-full" min={0} />
                </Form.Item>

                <Form.Item className="!flex-1" label="% Cọc" name="depositPercent">
                  <Input className="!w-full" disabled placeholder="Tự động tính" />
                </Form.Item>
              </div>

              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea placeholder="Ghi chú thêm về đơn hàng..." />
              </Form.Item>

              <div className="p-3 rounded bg-gray-50 border mt-4">
                <h4 className="font-medium mb-2">Tổng kết Đơn hàng</h4>
                <p>Giá sản phẩm: 0 đ</p>
                <p>Phí dịch vụ: 0 đ</p>
                <p className="font-semibold">Tổng cộng: 0 đ</p>
                <p className="text-green-600">Tiền cọc: 0 đ</p>
                <p className="text-red-600">Còn lại: 0 đ</p>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
