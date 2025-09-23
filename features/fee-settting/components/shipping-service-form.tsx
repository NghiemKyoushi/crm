"use client";

import React from "react";
import { Form, InputNumber, Button, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faList, faSave, faConciergeBell } from "@fortawesome/free-solid-svg-icons";

type FormValues = {
  serviceFee: {
    us: number;
    jp: number;
    extraKg: number;
    checkUs: number;
    checkJp: number;
  };
  delivery: {
    kv1: { fee: number; freeUs: number; freeJp: number };
    kv2: { fee: number; freeUs: number; freeJp: number };
    kv3: { fee: number };
  };
};

export default function ShippingServiceForm() {
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = (values: FormValues) => {
    console.log("✅ Submit values:", values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        serviceFee: { us: 4, jp: 3, extraKg: 5000, checkUs: 5, checkJp: 10000 },
        delivery: {
          kv1: { fee: 50000, freeUs: 10, freeJp: 5 },
          kv2: { fee: 100000, freeUs: 20, freeJp: 10 },
          kv3: { fee: 200000 },
        },
      }}
    >
      {/* Phí dịch vụ khác */}
      <Card
        title={
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <FontAwesomeIcon icon={faConciergeBell} className="w-5 h-5"/> Phí Dịch Vụ Khác (Áp dụng chung)
          </div>
        }
        className="mb-6"
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="!bg-gray-50 p-4 !rounded-lg !border !border-gray-200 !space-y-3">
            <Form.Item
              label="Phí mua hộ (%) - Tuyến Mỹ"
              name={["serviceFee", "us"]}
              rules={[{ required: true, message: "Nhập phí mua hộ Mỹ" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item
              label="Phí mua hộ (%) - Tuyến Nhật"
              name={["serviceFee", "jp"]}
              rules={[{ required: true, message: "Nhập phí mua hộ Nhật" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>

          <div className="!bg-gray-50 p-4 !rounded-lg !border !border-gray-200 !space-y-3">
            <Form.Item
              label="Phí gia cố (VNĐ/Kg)"
              name={["serviceFee", "extraKg"]}
              rules={[{ required: true, message: "Nhập phí gia cố" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>

          <div className="!bg-gray-50 p-4 !rounded-lg !border !border-gray-200 !space-y-3">
            <Form.Item
              label="Phí kiểm đếm/chụp ảnh - Tại Mỹ (USD/track)"
              name={["serviceFee", "checkUs"]}
              rules={[{ required: true, message: "Nhập phí tại Mỹ" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item
              label="Phí kiểm đếm/chụp ảnh - Tại Nhật (VNĐ/track)"
              name={["serviceFee", "checkJp"]}
              rules={[{ required: true, message: "Nhập phí tại Nhật" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      </Card>

      {/* Phí giao hàng nội thành */}
      <Card
        className="!mt-8"
        title={
          <div className="flex items-center gap-2 font-bold !text-green-800">
            <FontAwesomeIcon icon={faTruck}  className="w-5 h-5"/> Phí Giao Hàng Nội Thành Hà Nội
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-6">
          {/* KV1 */}
          <Card size="small" className="!bg-green-50 p-4 !rounded-lg !border !border-green-200 !space-y-3">
            <h3 className="font-semibold text-green-900">KV1 (Hoàn Kiếm, Ba Đình...)</h3>
            <Form.Item
              label="Phí giao hàng (VNĐ)"
              name={["delivery", "kv1", "fee"]}
              rules={[{ required: true, message: "Nhập phí KV1" }]}
              className="!mb-1"
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item className="!mb-1" label="Miễn phí tuyến Mỹ (Kg >)" name={["delivery", "kv1", "freeUs"]}>
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item className="!mb-1" label="Miễn phí tuyến Nhật (Kg >)" name={["delivery", "kv1", "freeJp"]}>
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </Card>

          {/* KV2 */}
          <Card size="small" className="!bg-green-50 p-4 !rounded-lg !border !border-green-200 !space-y-3">
            <h3 className="font-semibold text-green-900">KV2 (Long Biên, Thanh Trì)</h3>
            <Form.Item
              label="Phí giao hàng (VNĐ)"
              name={["delivery", "kv2", "fee"]}
              rules={[{ required: true, message: "Nhập phí KV2" }]} className="!mb-1"
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item className="!mb-1" label="Miễn phí tuyến Mỹ (Kg >)" name={["delivery", "kv2", "freeUs"]}>
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item className="!mb-1" label="Miễn phí tuyến Nhật (Kg >)" name={["delivery", "kv2", "freeJp"]}>
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </Card>

          {/* KV3 */}
          <Card size="small" className="!bg-green-50 p-4 !rounded-lg !border !border-green-200 !space-y-3">
            <h3 className="font-semibold text-green-900">KV3 (Huyện Gia Lâm)</h3>
            <Form.Item className="!mb-1"
              label="Phí giao hàng (VNĐ)"
              name={["delivery", "kv3", "fee"]}
              rules={[{ required: true, message: "Nhập phí KV3" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <p className="text-gray-500 text-sm">Không áp dụng miễn phí</p>
          </Card>
        </div>
      </Card>

      {/* Save button */}
      <div className="text-right border-t-gray-100 pt-6 mt-8">
        <Button
          type="primary"
          htmlType="submit"
          className="bg-blue-600 hover:!bg-blue-700 px-6 h-11 font-bold"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" /> Lưu Tất Cả Thay Đổi
        </Button>
      </div>
    </Form>
  );
}
