"use client";

import React from "react";
import { Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faConciergeBell,
  faExchangeAlt,
  faPallet,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import InsuranceSettings from "@/features/fee-settting/components/insurance-settings";
import ShippingServiceForm from "@/features/fee-settting/components/shipping-service-form";
import ShippingSurchangeTable from "@/features/fee-settting/components/shipping-surchange";
import ExchangeRateSettings from "./category-rate-setting";
import { useParams } from "next/navigation";

const CategorySettingsPage: React.FC = () => {
  const params = useParams();
  const id = params.id;

  const items = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon className="w-4 h-4" icon={faExchangeAlt} />
          Tỷ Giá Ngoại Tệ
        </span>
      ),
      children: <ExchangeRateSettings />,
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon className="w-4 h-4" icon={faPallet} />
          Vận Chuyển & Phụ Thu
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
          Dịch Vụ & Giao Hàng
        </span>
      ),
      children: <ShippingServiceForm />,
    },
    {
      key: "4",
      label: (
        <span className="flex items-center gap-2">
          <FontAwesomeIcon className="w-4 h-4" icon={faShield} />
          Bảo Hiểm & Quy Định Chung
        </span>
      ),
      children: <InsuranceSettings />,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mt-5">
      <h3 className="text-xl font-semibold mb-4">
        Cài đặt phí riêng cho loại khách hàng
      </h3>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default CategorySettingsPage;
