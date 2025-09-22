"use client";

import React, { useEffect } from "react";
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
import {
  useListFeeSettingDefault,
  useUpdateFeeSettingDefault,
} from "../hooks/fee-setting";
import { on } from "node:stream";
import { mapFormToData } from "@/types/fee-setting";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export interface ShippingRouteData {
  id: number;
  name: string;
  value: number;
}

// Các loại phí (SURCHARGE, SERVICE, SHIPPING)
export interface FeeType {
  fee_type: "SURCHARGE" | "SERVICE" | "SHIPPING";
  shipping_route_data: ShippingRouteData[];
}

// Dữ liệu phí theo tuyến vận chuyển
export interface FeeCommonData {
  route_code: string; // VD: "JP_VN", "US_VN"
  fee_types: FeeType[];
}

// Chính sách chung
export interface GeneralPolicy {
  id: number;
  code: string; // "GENERAL_POLICY"
  free_storage_days: number;
  storage_fee_per_kg_per_day: number;
  min_deposit_percent: number;
}

// Phí theo khu vực vận chuyển
export interface ShippingZoneFee {
  id: number;
  code: string; // VD: "KV1"
  name: string;
  description: string;
  city: string;
  fee_amount: number;
  free_weight_us: number | null;
  free_weight_japan: number | null;
}

const FeeSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const { handleSubmit, control, getValues, setValue, reset } = useForm({
    defaultValues: {},
  });
  const { data: apiData } = useListFeeSettingDefault();
  const updateFeeSettingMutation = useUpdateFeeSettingDefault();

  const onSubmit = (data: any) => {
    updateFeeSettingMutation.mutate(mapFormToData(data), {
      onSuccess: () => {
        toast.success(t("common.success"));
      },
      onError: (err: any) =>
        toast.error(err.response?.data?.localizedMessage || t("common.error")),
    });
  };

  const DynamicShippingForm = ({
    data,
    control,
  }: {
    data: {
      fee_common_data: FeeCommonData[];
      general_policy: GeneralPolicy[];
      shipping_zone_fee: ShippingZoneFee[];
    };
    control: any;
    onSubmit: (data: any) => void;
  }) => {
    return (
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {data.fee_common_data &&
          data.fee_common_data.map((route) => (
            <div key={route.route_code} className="space-y-4">
              {/* Header tuyến */}
              <div className={`py-1 border-b font-semibold  flex items-center gap-2 ${route.route_code === "US_VN" ? 'text-red-700': 'text-blue-700'}`}>
               <FontAwesomeIcon icon={route.route_code === "US_VN" ? faFlagUsa: faFlag}/> TUYẾN {route.route_code.replace("_", " → ").toUpperCase()}
              </div>

              {route.fee_types.map((feeType) => (
                <div
                  key={feeType.fee_type}
                  className={
                    route.route_code === "US_VN"
                      ? ` rounded-lg p-4 ${
                          feeType.fee_type === "SHIPPING"
                            ? "bg-red-50 border border-red-200 rounded-lg"
                            : feeType.fee_type === "SURCHARGE"
                            ? "bg-orange-50 border border-orange-200 rounded-lg"
                            : "bg-blue-50 border border-blue-200 rounded-lg"
                        }`
                      : `rounded-lg p-4 ${
                          feeType.fee_type === "SHIPPING"
                            ? "bg-blue-50 border border-blue-200 rounded-lg"
                            : feeType.fee_type === "SURCHARGE"
                            ? "bg-green-50 border border-green-200 rounded-lg"
                            : "bg-purple-50 border border-blue-200 rounded-lg"
                        }`
                  }
                >
                  <div
                    className={
                      route.route_code === "US_VN"
                        ? ` font-semibold mb-2  ${
                            feeType.fee_type === "SHIPPING"
                              ? "text-red-800 "
                              : feeType.fee_type === "SURCHARGE"
                              ? "text-orange-800 "
                              : "text-blue-800 "
                          }`
                        : `font-semibold mb-2 ${
                            feeType.fee_type === "SHIPPING"
                              ? "text-blue-800 "
                              : feeType.fee_type === "SURCHARGE"
                              ? "text-green-800 "
                              : "text-purple-800 "
                          }`
                    }
                  >
                    {feeType.fee_type === "SHIPPING" &&
                      "Phí Vận chuyển (VNĐ/Kg)"}
                    {feeType.fee_type === "SURCHARGE" && "Phụ Thu"}
                    {feeType.fee_type === "SERVICE" && "Phí Dịch Vụ Khác"}
                  </div>

                  <div
                    className={`grid grid-cols-2 gap-4 ${
                      feeType.fee_type === "SHIPPING"
                        ? "m-3 p-3 space-y-2 bg-white rounded-xl"
                        : ""
                    }`}
                  >
                    {feeType.shipping_route_data.map((item) => {
                      const fieldName = `${route.route_code}_${feeType.fee_type}_${item.id}`;
                      return (
                        <div key={fieldName}>
                          <label className="block mb-1">{item.name}</label>
                          <Controller
                            name={fieldName}
                            control={control}
                            defaultValue={item.value}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                  `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )
                                }
                                parser={(value: any) =>
                                  value.replace(/\$\s?|(,*)/g, "")
                                }
                              />
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Giao hàng nội thành */}
        <div className="py-1 border-b font-semibold text-green-700 flex items-center gap-2">
          GIAO HÀNG NỘI THÀNH HÀ NỘI
        </div>
        <div className="bg-green-50 rounded-lg p-4 space-y-4">
          {data.shipping_zone_fee.map((zone) => (
            <div key={zone.id} className="bg-white p-4 rounded-lg ">
              {/* <div className="font-medium mb-2">{zone.name}</div> */}
              <div className="font-medium mb-2">
                {zone.name} ({zone.description})
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name={`zone_${zone.id}_fee`}
                  control={control}
                  defaultValue={zone.fee_amount}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: "100%" }}
                      placeholder="Phí giao hàng (VNĐ)"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  )}
                />
                <Controller
                  name={`zone_${zone.id}_free_us`}
                  control={control}
                  defaultValue={zone.free_weight_us}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: "100%" }}
                      placeholder="Miễn phí tuyến Mỹ >kg"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  )}
                />
                <Controller
                  name={`zone_${zone.id}_free_jp`}
                  control={control}
                  defaultValue={zone.free_weight_japan}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: "100%" }}
                      placeholder="Miễn phí tuyến Nhật >kg"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Quy định chung */}
        <div className="py-1 border-b font-semibold text-yellow-700 flex items-center gap-2">
          QUY ĐỊNH CHUNG
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 grid grid-cols-3 gap-4">
          <Controller
            name="general_free_storage_days"
            control={control}
            defaultValue={data.general_policy[0].free_storage_days}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: "100%" }}
                placeholder="Thời gian lưu kho miễn phí (ngày)"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
              />
            )}
          />
          <Controller
            name="general_storage_fee"
            control={control}
            defaultValue={data.general_policy[0].storage_fee_per_kg_per_day}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: "100%" }}
                placeholder="Phí lưu kho (VNĐ/kg/ngày)"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
              />
            )}
          />
          <Controller
            name="general_deposit_percent"
            control={control}
            defaultValue={data.general_policy[0].min_deposit_percent}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: "100%" }}
                placeholder="Đặt cọc tối thiểu (%)"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
              />
            )}
          />
        </div>

        <div className="text-right">
          <Button type="primary" htmlType="submit">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    );
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
          {apiData && (
            <DynamicShippingForm
              control={control}
              data={apiData}
              onSubmit={onSubmit}
            />
          )}
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
