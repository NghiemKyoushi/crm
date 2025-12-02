"use client";

import React from "react";
import { Button, Tabs } from "antd";
import { ArrowLeftOutlined, ContainerOutlined, SafetyOutlined, SwapOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import InsuranceSettings from "@/features/fee-settting/components/insurance-settings";
import ShippingServiceForm from "@/features/fee-settting/components/shipping-service-form";
import ShippingSurchangeTable from "@/features/fee-settting/components/shipping-surchange";
import ExchangeRateSettings from "./customer-group-rate-setting";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const CategorySettingsPage: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const { t } = useTranslation();
  const router = useRouter();
  const items = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <SwapOutlined style={{ fontSize: 16 }} />
          {t("categoryCustomer.exchangeRate")}
        </span>
      ),
      children: <ExchangeRateSettings />,
    },
    ...(id !== "1"
      ? [
          {
            key: "2",
            label: (
              <span className="flex items-center gap-2">
                <ContainerOutlined style={{ fontSize: 16 }} />
                {t("categoryCustomer.shippingAndSurcharge")}
              </span>
            ),
            children: id && <ShippingSurchangeTable isCategory={true} idCategory={+id} />,
          },
          {
            key: "3",
            label: (
              <span className="flex items-center gap-2">
                <CustomerServiceOutlined style={{ fontSize: 16 }} />
                {t("categoryCustomer.servicesAndDelivery")}
              </span>
            ),
            children: id && <ShippingServiceForm groupId={+id} />,
          },
          {
            key: "4",
            label: (
              <span className="flex items-center gap-2">
                <SafetyOutlined style={{ fontSize: 16 }} />
                {t("categoryCustomer.insuranceAndRegulations")}
              </span>
            ),
            children: id && <InsuranceSettings groupId={+id} />,
          },
        ]
      : []),
  ];
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mt-5">
      <button className="cursor-pointer" onClick={() => router.back()}>
        <ArrowLeftOutlined />
      </button>

      <div className="flex items-center justify-between mb-2 mt-4">
        <h3 className="text-xl font-semibold">
          {t("categoryCustomer.customFeeSettings")}
        </h3>
      </div>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default CategorySettingsPage;
