"use client";

import React, { useEffect } from "react";
import { Tabs, Alert, Form, InputNumber, Button, Input } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faConciergeBell,
  faExchangeAlt,
  faFlag,
  faFlagUsa,
  faInfoCircle,
  faPallet,
  faShield,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import InsuranceSettings from "@/features/fee-settting/components/insurance-settings";
import ShippingServiceForm from "@/features/fee-settting/components/shipping-service-form";
import ShippingSurchangeTable from "@/features/fee-settting/components/shipping-surchange";
import ExchangeRateSettings from "./category-rate-setting";

export interface ShippingRouteData {
  id: number;
  name: string;
  value: number;
}

export interface FeeType {
  fee_type: "SURCHARGE" | "SERVICE" | "SHIPPING";
  shipping_route_data: ShippingRouteData[];
}

export interface FeeCommonData {
  route_code: string; // VD: "JP_VN", "US_VN"
  fee_types: FeeType[];
}

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

const CategorySettingsPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mt-5">
      {/* Tiêu đề */}
      <h3 className="text-xl font-semibold mb-4">
        Quản Lý Phí & Cài Đặt Dịch Vụ Toàn Diện
      </h3>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane
          key="1"
          tab={
            <span className="flex items-center gap-2">
              <FontAwesomeIcon className="w-4 h-4" icon={faExchangeAlt} />
              Tỷ Giá Ngoại Tệ
            </span>
          }
        >
          <ExchangeRateSettings />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="2"
          tab={
            <span className="flex items-center gap-2">
              <FontAwesomeIcon className="w-4 h-4" icon={faPallet} />
              Vận Chuyển & Phụ Thu
            </span>
          }
        >
          <ShippingSurchangeTable />
        </Tabs.TabPane>

        <Tabs.TabPane
          key="3"
          tab={
            <span className="flex items-center gap-2">
              <FontAwesomeIcon className="w-4 h-4" icon={faConciergeBell} />
              Dịch Vụ & Giao Hàng
            </span>
          }
        >
          <ShippingServiceForm />
        </Tabs.TabPane>

        <Tabs.TabPane
          key="4"
          tab={
            <span className="flex items-center gap-2">
              <FontAwesomeIcon className="w-4 h-4" icon={faShield} />
              Bảo Hiểm & Quy Định Chung
            </span>
          }
        >
          <InsuranceSettings />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default CategorySettingsPage;
