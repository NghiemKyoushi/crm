"use client";

import React from "react";
import { Form, InputNumber, Button, Card, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSave, faShield } from "@fortawesome/free-solid-svg-icons";

interface InsuranceFormValues {
  usDefault: number;
  jpDefault: number;
  highValue: number;
  freeDays: number;
  storageFee: number;
  depositRate: number;
}

const InsuranceSettings: React.FC = () => {
  const [form] = Form.useForm<InsuranceFormValues>();

  const onFinish = (values: InsuranceFormValues) => {
    console.log("Form submitted:", values);
    message.success("Lưu thành công!");
  };

  return (
    <div className="space-y-6">
      {/* Cài đặt bảo hiểm */}
      <Card
        title={
          <div className="flex items-center gap-2 font-bold text-lg">
            <FontAwesomeIcon icon={faShield} className="w-5 h-5 " />
            Cài Đặt Bảo Hiểm
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gói mặc định */}
          <div className=" bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
            <h3 className=" mb-4 font-semibold text-blue-800">
              Gói Mặc Định (Không mua bảo hiểm)
            </h3>
            <p className="text-sm text-blue-600 mb-2">
             Mức bồi thường tối đa khi mất hàng:
            </p>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Tuyến Mỹ (USD/sản phẩm)"
                name="usDefault"
                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                className="!mb-1"
              >
                <InputNumber className="!w-full" min={0} />
              </Form.Item>

              <Form.Item
              className="!mb-1"
                label="Tuyến Nhật (VNĐ/sản phẩm)"
                name="jpDefault"
                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
              >
                <InputNumber className="!w-full" min={0} />
              </Form.Item>
            </Form>
          </div>

          {/* Gói giá trị cao */}
          <div className="bg-yellow-50 p-4 rounded-lg space-y-3 border border-yellow-200">
            <h3 className=" mb-4 font-semibold text-yellow-800">Gói Hàng Giá Trị Cao</h3>
            <p className="text-sm text-yellow-600 mb-2">
              Bồi thường 100% giá trị sản phẩm (yêu cầu invoice).
            </p>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Phí bảo hiểm (% giá trị hàng)"
                name="highValue"
                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
              >
                <InputNumber className="!w-full" min={0} max={100} />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>

      {/* Quy định chung */}
      <Card
        title={
          <div className="flex items-center gap-2 font-bold text-lg">
            <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 " />
            Quy Định Chung
          </div>
        }
        className="!mt-8"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item
              label="Thời gian lưu kho miễn phí (ngày)"
              name="freeDays"
              rules={[{ required: true, message: "Vui lòng nhập số ngày" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>

            <Form.Item
              label="Phí lưu kho sau đó (VNĐ/kg/ngày)"
              name="storageFee"
              rules={[{ required: true, message: "Vui lòng nhập phí lưu kho" }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>

            <Form.Item
              label="Đặt cọc mua hộ tối thiểu (%)"
              name="depositRate"
              rules={[{ required: true, message: "Vui lòng nhập tỉ lệ" }]}
            >
              <InputNumber className="!w-full" min={0} max={100} />
            </Form.Item>
          </div>

          
        </Form>
      </Card>
      <div className="text-right border-t-gray-100 pt-6 mt-8">
            <button
              className="bg-blue-600 hover:bg-blue-700 !text-white !font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
             <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" /> Lưu Tất Cả Thay Đổi
            </button>
          </div>
    </div>
  );
};

export default InsuranceSettings;
