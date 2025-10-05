"use client";

import React from "react";
import { Button, Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faConciergeBell,
  faExchangeAlt,
  faPallet,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import InsuranceSettings from "@/features/fee-settting/components/insurance-settings";
import ShippingServiceForm from "@/features/fee-settting/components/shipping-service-form";
import ShippingSurchangeTable from "@/features/fee-settting/components/shipping-surchange";
import ExchangeRateSettings from "./category-rate-setting";
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
          <FontAwesomeIcon className="w-4 h-4" icon={faExchangeAlt} />
          {t("categoryCustomer.exchangeRate")}
        </span>
      ),
      children: <ExchangeRateSettings />,
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon className="w-4 h-4" icon={faPallet} />
          {t("categoryCustomer.shippingAndSurcharge")}
        </span>
      ),
      children: id ? (
        <ShippingSurchangeTable isCategory={true} idCategory={+id} />
      ) : null,
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon className="w-4 h-4" icon={faConciergeBell} />
          {t("categoryCustomer.servicesAndDelivery")}
        </span>
      ),
      children: id ? <ShippingServiceForm groupId={+id} />: null
    },
    {
      key: "4",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon className="w-4 h-4" icon={faShield} />
          {t("categoryCustomer.insuranceAndRegulations")}
        </span>
      ),
      children: <InsuranceSettings />,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mt-5">
      <button className="cursor-pointer" onClick={() => router.back()}>
        <FontAwesomeIcon icon={faArrowLeft} />
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
