"use client";

import React from "react";
import { Tabs, Alert, Form, InputNumber, Button, Input } from "antd";
import InsuranceSettings from "./insurance-settings";
import ShippingSettings from "./shipping-settings";
import { Controller, useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlag,
  faFlagUsa,
  faInfoCircle,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";

type ShippingFeeFormValues = {
  // Phí vận chuyển
  normal: number;
  highValue: number;
  apple: number;
  iphone300: number;
  iphone500: number;
  high500_2000: number;
  high2000: number;

  // Phụ thu
  surchargeNormal: number;
  surchargeHighValue: number;
  surchargeApple: number;
  surchargeIphone300: number;
  surchargeIphone500: number;
  surcharge500_2000: number;
  surcharge2000: number;

  // Phí dịch vụ khác
  phiMuaHo: number;
  phiGiaCo: number;
  phiKiemDem: number;

  // Tuyến Mỹ
  us_normal: number;
  us_highValue: number;
  us_apple: number;
  us_iphone300: number;
  us_iphone500: number;
  us_high500_2000: number;
  us_high2000: number;

  // Tuyến Nhật Bản
  jp_normal: number;
  jp_linhKien: number;
  jp_iphone15: number;

  // Phụ thu
  surchargeNormals: number;
  surchargeHighValue5_10: number;
  surchargeHighValue10_30: number;
  surchargeApples: number;
  surchargeIphone12_14: number;
  surchargeIphone15: number;
  surchargeLaptop10: number;
  surchargeLaptop20: number;
  surchargeLaptop20Percent: number;
  surchargeAmply20Percent: number;
  surchargeHighValue50: number;

  // Giao hàng nội thành Hà Nội
  kv1_fee: number;
  kv1_free_us: number;
  kv1_free_jp: number;

  kv2_fee: number;
  kv2_free_us: number;
  kv2_free_jp: number;

  kv3_fee: number;

  // Quy định chung
  free_storage_days: number;
  storage_fee: number;
  deposit_percent: number;
};
const FeeSettingsPage: React.FC = () => {
  const { handleSubmit, control, getValues, setValue } =
    useForm<ShippingFeeFormValues>({
      defaultValues: {
        normal: 235000,
        highValue: 230000,
        apple: 245000,
        iphone300: 230000,
        iphone500: 230000,
        high500_2000: 230000,
        high2000: 230000,

        surchargeNormal: 0,
        surchargeHighValue: 30000,
        surchargeApple: 100000,
        surchargeIphone300: 400000,
        surchargeIphone500: 500000,
        surcharge500_2000: 3,
        surcharge2000: 5,
      },
    });

  const handleFinish = (values: any) => {
    console.log("Form Values:", values);
  };
  const onSubmit = (data: ShippingFeeFormValues) => {
    console.log("🚀 Data form:", data);
  };

  const renderField = (
    name: keyof ShippingFeeFormValues,
    label: string,
    control: any
  ) => (
    <div className="grid grid-cols-2 gap-4 items-center">
      <span>{label}</span>
      <Controller
        name={name}
        control={control}
        render={({ field }) => <Input {...field} />}
      />
    </div>
  );

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header tuyến */}
            <div className="py-1 border-b border-red-200 flex items-center gap-2 text-red-700 font-semibold">
              <FontAwesomeIcon icon={faFlagUsa} />
              TUYẾN MỸ → VIỆT NAM
            </div>
            {/* Phí vận chuyển */}
            <div className="bg-red-50 border border-red-200 rounded-lg">
              <div className="px-4 py-2 border-b border-red-200 font-semibold text-red-800">
                Phí Vận chuyển (VNĐ/Kg)
              </div>
              <div className="m-3 p-3 space-y-2 bg-white">
                <div className="grid grid-cols-2 gap-4 items-center text-center">
                  <p>Kho Oregon/New Hampshire</p>
                  <p>Về Hà Nội</p>
                </div>
                {[
                  { label: "Hàng thông thường", name: "normal" },
                  { label: "Đồ giá trị cao >100$", name: "highValue" },
                  { label: "Apple Watch, Airpod >100$", name: "apple" },
                  { label: "Laptop, iPad, iPhone ≤300$", name: "iphone300" },
                  {
                    label: "Laptop, iPad, iPhone 300$-500$",
                    name: "iphone500",
                  },
                  {
                    label: "Hàng giá trị cao 500$-2000$",
                    name: "high500_2000",
                  },
                  { label: "Hàng giá trị cao >2000$", name: "high2000" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="grid grid-cols-2 gap-4 items-center"
                  >
                    <span>{item.label}</span>
                    <Controller
                      name={item.name as keyof ShippingFeeFormValues}
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Phụ thu */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg">
              <div className="px-4 py-2 border-b border-orange-200 font-semibold text-orange-700">
                Phụ Thu (VNĐ)
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                {[
                  { label: "Hàng thông thường", name: "surchargeNormal" },
                  { label: "Đồ giá trị cao >100$", name: "surchargeHighValue" },
                  {
                    label: "Apple Watch, Airpod >100$",
                    name: "surchargeApple",
                  },
                  {
                    label: "Laptop, iPad, iPhone ≤300$",
                    name: "surchargeIphone300",
                  },
                  {
                    label: "Laptop, iPad, iPhone 300$-500$",
                    name: "surchargeIphone500",
                  },
                  {
                    label: "Hàng giá trị cao 500$-2000$ (%)",
                    name: "surcharge500_2000",
                  },
                  {
                    label: "Hàng giá trị cao >2000$ (%)",
                    name: "surcharge2000",
                  },
                ].map((item) => (
                  <div key={item.name}>
                    <span className="block mb-1">{item.label}</span>
                    <Controller
                      name={item.name as keyof ShippingFeeFormValues}
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* PHÍ DỊCH VỤ KHÁC */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="px-4 py-2 border-b border-blue-200 font-semibold text-blue-600">
                Phí Dịch vụ Khác
              </div>
              <div className="p-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Phí mua hộ (%)", name: "phiMuaHo" },
                  { label: "Phí gia cố (VNĐ/Kg)", name: "phiGiaCo" },
                  {
                    label: "Phí kiểm đếm (USD/tracking)",
                    name: "phiKiemDem",
                  },
                ].map((item) => (
                  <div key={item.name}>
                    <span className="block mb-1">{item.label}</span>
                    <Controller
                      name={item.name as keyof ShippingFeeFormValues}
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* TUYẾN NHẬT */}
            <div className=" py-1 border-b border-blue-200 font-semibold text-blue-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faFlag} />
              TUYẾN NHẬT BẢN → VIỆT NAM
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="m-3 p-3 space-y-2 bg-white">
                {renderField("jp_normal", "Hàng thông thường", control)}
                {renderField(
                  "jp_linhKien",
                  "Hàng lô linh kiện điện thoại, máy tính",
                  control
                )}
                {renderField(
                  "jp_iphone15",
                  "Điện thoại iPhone 15, 16 pro max, Samsung S24 ultra",
                  control
                )}
              </div>
            </div>

            {/* PHỤ THU */}
            <div className="bg-green-50 border border-green-200 rounded-lg">
              <div className="px-4 py-2 border-b border-green-200 font-semibold text-green-700">
                Phụ Thu (VNĐ)
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                {renderField("surchargeNormal", "Hàng thông thường", control)}
                {renderField(
                  "surchargeHighValue5_10",
                  "Đồ giá trị cao 5-10 triệu VNĐ",
                  control
                )}
                {renderField(
                  "surchargeHighValue10_30",
                  "Đồ giá trị cao 10-30 triệu VNĐ",
                  control
                )}
                {renderField("surchargeApple", "Apple Watch, Airpod", control)}
                {renderField(
                  "surchargeIphone12_14",
                  "iPhone 12-14 pro max, Samsung",
                  control
                )}
                {renderField(
                  "surchargeIphone15",
                  "iPhone 15, 16 pro max, Samsung S24 ultra",
                  control
                )}
                {renderField(
                  "surchargeLaptop10",
                  "Laptop, iPad <10 triệu VNĐ",
                  control
                )}
                {renderField(
                  "surchargeLaptop20",
                  "Laptop, iPad <20 triệu VNĐ",
                  control
                )}
                {renderField(
                  "surchargeLaptop20Percent",
                  "Laptop, iPad >20 triệu VNĐ (%)",
                  control
                )}
                {renderField(
                  "surchargeAmply20Percent",
                  "Loa, đài, ampli >20 triệu VNĐ (%)",
                  control
                )}
                {renderField(
                  "surchargeHighValue50",
                  "Hàng giá trị cao >50 triệu VNĐ (%)",
                  control
                )}
              </div>
            </div>
            <div className="bg-purple-50 border border-blue-200 rounded-lg">
              <div className="px-4 py-2 border-b border-purple-200 font-semibold text-purple-600">
                Phí Dịch vụ Khác
              </div>
              <div className="p-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Phí mua hộ (%)", name: "phiMuaHo" },
                  { label: "Phí gia cố (VNĐ/Kg)", name: "phiGiaCo" },
                  {
                    label: "Phí kiểm đếm (USD/tracking)",
                    name: "phiKiemDem",
                  },
                ].map((item) => (
                  <div key={item.name}>
                    <span className="block mb-1">{item.label}</span>
                    <Controller
                      name={item.name as keyof ShippingFeeFormValues}
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className=" py-1 border-b border-green-200 font-semibold text-green-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faTruck} /> GIAO HÀNG NỘI THÀNH HÀ NỘI
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg">
              <div className="p-4 space-y-4">
                {/* KV1 */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="font-medium mb-2">
                    KV1 (Hoàn Kiếm, Ba Đình, Hai Bà Trưng, Tây Hồ, Đống Đa, Cầu
                    Giấy, Thanh Xuân, Bắc Từ Liêm, Hoàng Mai, Hà Đông)
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Phí giao hàng (VNĐ)",
                        name: "kv2_fee",
                      },
                      {
                        label: "Miễn phí tuyến Mỹ >kg",
                        name: "kv2_free_us",
                      },
                      {
                        label: "Miễn phí tuyến Nhật >kg",
                        name: "kv2_free_jp",
                      },
                    ].map((item) => (
                      <div key={item.name}>
                        <span className="block mb-1">{item.label}</span>
                        <Controller
                          name={item.name as keyof ShippingFeeFormValues}
                          control={control}
                          render={({ field }) => <Input {...field} />}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* KV2 */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="font-medium mb-2">
                    KV2 (Long Biên, Thanh Trì)
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Phí giao hàng (VNĐ)",
                        name: "kv2_fee",
                      },
                      {
                        label: "Miễn phí tuyến Mỹ >kg",
                        name: "kv2_free_us",
                      },
                      {
                        label: "Miễn phí tuyến Nhật >kg",
                        name: "kv2_free_jp",
                      },
                    ].map((item) => (
                      <div key={item.name}>
                        <span className="block mb-1">{item.label}</span>
                        <Controller
                          name={item.name as keyof ShippingFeeFormValues}
                          control={control}
                          render={({ field }) => <Input {...field} />}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* KV3 */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="font-medium mb-2">KV3 (Huyện Gia Lâm)</div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("kv3_fee", "Phí giao hàng (VNĐ)", control)}
                    <div className="flex items-center text-gray-500">
                      Không miễn phí
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUY ĐỊNH CHUNG */}
            <div className="py-1 border-b border-yellow-200 font-semibold text-yellow-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} /> QUY ĐỊNH CHUNG
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="p-4 grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Thời gian lưu kho miễn phí (ngày)",
                    name: "free_storage_days",
                  },
                  {
                    label: "Phí lưu kho sau đó (VNĐ/kg/ngày)",
                    name: "storage_fee",
                  },
                  {
                    label: "Đặt cọc tối thiểu (%)",
                    name: "deposit_percent",
                  },
                ].map((item) => (
                  <div key={item.name}>
                    <span className="block mb-1">{item.label}</span>
                    <Controller
                      name={item.name as keyof ShippingFeeFormValues}
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="text-right">
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Tabs.TabPane>

        {/* Tab 2 */}
        <Tabs.TabPane tab="Cài đặt bảo hiểm" key="2">
          <InsuranceSettings />
        </Tabs.TabPane>

        {/* Tab 3 */}
        <Tabs.TabPane tab="Đường vận chuyển" key="3">
          <ShippingSettings />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default FeeSettingsPage;
