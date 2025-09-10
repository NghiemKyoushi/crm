"use client";

import React from "react";
import { Tabs, Alert, Form, InputNumber, Button } from "antd";
import InsuranceSettings from "./insurance-settings";
import ShippingSettings from "./shipping-settings";

const FeeSettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log("Form Values:", values);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mt-5">
      {/* Tiêu đề */}
      <h3 className="text-xl font-semibold mb-4">
        Quản lý Phí Dịch vụ Mặc định
      </h3>

      {/* Alert Thông tin quan trọng */}
      <Alert
        type="warning"
        showIcon
        message={
          <div>
            <strong className="text-yellow-800">Thông tin quan trọng:</strong>
            <div className="text-yellow-700">
              Đây là các mức phí mặc định áp dụng cho toàn bộ hệ thống.
            </div>
            <div className="text-yellow-700">
              Cài đặt phí riêng cho từng khách hàng: Vui lòng truy cập trang{" "}
              <b>Chi tiết 360°</b> của khách hàng từ menu{" "}
              <b>Quản lý Người dùng</b>.
            </div>
          </div>
        }
        className="!mb-6 !border-l-4 !border-yellow-400 !bg-yellow-50"
      />

      {/* Tabs */}
      <Tabs defaultActiveKey="1">
        {/* Tab 1: Phí mặc định */}
        <Tabs.TabPane tab="Phí mặc định" key="1">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              purchaseFeePercent: 5,
              purchaseFeeMin: 50000,
              shippingFeeUS: 5,
              shippingFeeJP: 500,
              paymentFeePercent: 1,
              paymentFeeJP: 200,
              cancelFeeVND: 100000,
              cancelFeePercent: 2,
            }}
          >
            {/* Phí Mua hộ */}
            <div className="mb-1">
              <h3 className="text-lg font-semibold mb-2 border-b border-gray-200 pb-1">
                Phí mua hộ
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Form.Item
                  className="!mb-0"
                  name="purchaseFeePercent"
                  label="Phí theo % giá trị đơn hàng"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
                <Form.Item
                  name="purchaseFeeMin"
                  label="Phí cố định tối thiểu (VND)"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
              </div>
              <p className="-mt-6 text-xs">* Phí mua hộ có thể được cài đặt riêng cho từng khách hàng</p>

            </div>

            {/* Phí Vận chuyển nội địa (COD) */}
            <div className="mb-1">
              <h3 className="text-lg font-semibold mb-2 border-b border-gray-200 pb-1">
                Phí vận chuyển Nội địa (COD)
              </h3>
              <Alert
                type="warning"
                showIcon
                message={
                  <div>
                    <strong className="text-yellow-800">
                      Lưu ý quan trọng:
                    </strong>
                    <div className="text-yellow-700">
                      Phí này chỉ tính khi: Ship nội địa + Giá trên sản phẩm +
                      Thanh toán COD.
                    </div>
                  </div>
                }
                className="!mt-3 !mb-4 !border-l-4 !border-yellow-400 !bg-yellow-50"
              />
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="shippingFeeUS"
                  label="Phí tại Mỹ (USD)"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
                <Form.Item
                  name="shippingFeeJP"
                  label="Phí tại Nhật (JPY)"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
              </div>
            </div>

            {/* Phí Thanh toán */}
            <div className="mb-1">
              <h3 className="text-lg font-semibold border-b border-gray-200 pb-1">
                Phí thanh toán
              </h3>
              <Alert
                type="info"
                showIcon
                message={
                  <div>
                    <strong className="text-blue-800">Thông tin:</strong>
                    <div className="text-blue-700">
                      Phí thanh toán trên hóa đơn theo bên tính đồng bộ. Mặc
                      định: 200 yên một bên.
                    </div>
                  </div>
                }
                className="!mt-3 !mb-4 !border-l-4 !border-blue-400 !ßbg-blue-50"
              />
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="paymentFeePercent"
                  label="Phí thanh toán (%)"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
                <Form.Item
                  name="paymentFeeJP"
                  label="Phí cố định (JPY)"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
              </div>
            </div>

            {/* Phí Hủy đơn */}
            <div className="mb-1">
              <h3 className="text-lg font-semibold mb-2 border-b border-gray-200 pb-1">
                Phí hủy đơn
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Form.Item
                  name="cancelFeeVND"
                  label="Phí hủy đơn (VND)"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
                <Form.Item
                  name="cancelFeePercent"
                  label="Phí hủy đơn (%)"
                  rules={[{ required: true, message: "Vui lòng nhập phí" }]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
              </div>
            </div>

            {/* Submit */}
            <Form.Item className="flex justify-end">
              <Button type="primary" htmlType="submit" className="bg-blue-500">
                Lưu tất cả thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        {/* Tab 2 */}
        <Tabs.TabPane tab="Cài đặt bảo hiểm" key="2">
          <InsuranceSettings/>
        </Tabs.TabPane>

        {/* Tab 3 */}
        <Tabs.TabPane tab="Đường vận chuyển" key="3">
         <ShippingSettings/>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default FeeSettingsPage;
