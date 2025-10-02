"use client";

import React, { useState } from "react";
import { Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faConciergeBell,
  faPallet,
  faShield,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

// Import các component con
import ShippingSurchangeTable from "./shipping-surchange";
import ShippingServiceForm from "./shipping-service-form";
import InsuranceSettings from "./insurance-settings";
import ProductTypeTable from "./product-category";

// --- Types ---
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

export interface ShippingZoneFee {
  id: number;
  code: string;
  name: string;
  description: string;
  city: string;
  fee_amount: number;
  free_weight_us: number | null;
  free_weight_japan: number | null;
}

const FeeSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState("1");

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mt-5">
      {/* Tiêu đề */}
      <h3 className="text-lg font-medium text-gray-800 mb-6">
        {t('feeSettings.comprehensiveFeeManagement')}
      </h3>

      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        items={[
          {
            key: "1",
            label: (
              <span className="flex items-center gap-2 text-sm">
                <FontAwesomeIcon className="w-4 h-4" icon={faPallet} />
                {t('feeSettings.shippingAndSurcharge')}
              </span>
            ),
            children: <ShippingSurchangeTable />,
          },
          {
            key: "2",
            label: (
              <span className="flex items-center gap-2 text-sm">
                <FontAwesomeIcon className="w-4 h-4" icon={faConciergeBell} />
                {t('feeSettings.serviceAndDelivery')}
              </span>
            ),
            children: <ShippingServiceForm />,
          },
          {
            key: "3",
            label: (
              <span className="flex items-center gap-2 text-sm">
                <FontAwesomeIcon className="w-4 h-4" icon={faShield} />
                {t('feeSettings.insuranceAndRegulations')}
              </span>
            ),
            children: <InsuranceSettings />,
          },
          {
            key: "4",
            label: (
              <span className="flex items-center gap-2 text-sm">
                <FontAwesomeIcon className="w-4 h-4" icon={faTag} />
                {t('feeSettings.productTypes')}
              </span>
            ),
            children: <ProductTypeTable />,
          },
        ]}
      />
    </div>
  );
};

export default FeeSettingsPage;
