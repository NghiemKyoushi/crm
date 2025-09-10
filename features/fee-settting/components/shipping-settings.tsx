"use client";

import React, { useState } from "react";
import { Checkbox, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag } from "@fortawesome/free-solid-svg-icons";

interface ShippingOption {
  key: string;
  name: string;
  time?: string;
  disabled?: boolean;
  note?: string;
  checked: boolean;
}

interface CountryShipping {
  country: string;
  code: string;
  flag: any; // icon của FontAwesome
  color: string;
  bgColor: string;
  options: ShippingOption[];
}

const ShippingSettings: React.FC = () => {
  const [countries, setCountries] = useState<CountryShipping[]>([
    {
      country: "Nhật Bản",
      code: "JP",
      flag: faFlag,
      color: "#1d4ed8", 
      bgColor: "#eff6ff",
      options: [
        { key: "air", name: "Đường hàng không (Air)", time: "7-10 ngày", checked: true },
        { key: "sea", name: "Đường biển (Sea)", time: "20-25 ngày", checked: true },
      ],
    },
    {
      country: "Hoa Kỳ",
      code: "US",
      flag: faFlag,
      color: "#dc2626", 
      bgColor: "#fef2f2",
      options: [
        { key: "air", name: "Đường hàng không (Air)", time: "10-14 ngày", checked: true },
        { key: "sea", name: "Đường biển (Sea)", disabled: true, note: "Hiện tại không hỗ trợ đường biển từ Mỹ", checked: false },
      ],
    },
  ]);

  const handleOptionChange = (countryCode: string, key: string, checked: boolean) => {
    setCountries((prev) =>
      prev.map((c) =>
        c.code === countryCode
          ? {
              ...c,
              options: c.options.map((opt) =>
                opt.key === key ? { ...opt, checked } : opt
              ),
            }
          : c
      )
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Cài đặt Đường vận chuyển</h3>
      <div className="flex gap-4">
        {countries.map((c) => (
          <div
            key={c.code}
            className="rounded-lg p-4 flex-1"
            style={{ backgroundColor: c.bgColor }}
          >
            <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: c.color }}>
              <FontAwesomeIcon icon={c.flag} />
              {c.country} ({c.code})
            </div>
            <div className="space-y-1">
              {c.options.map((opt) => (
                <div key={opt.key}>
                  <Checkbox
                    checked={opt.checked}
                    disabled={opt.disabled}
                    onChange={(e) => handleOptionChange(c.code, opt.key, e.target.checked)}
                  >
                      <div className="flex flex-col">
    <span className="font-semibold">{opt.name}</span>
    {opt.time && (
      <span className="text-gray-500 text-xs">Thời gian: {opt.time}</span>
    )}

  </div>
                  </Checkbox>
                  {opt.note && (
                    <div className="text-red-500 text-sm ml-6">{opt.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-right mt-4">
        <Button type="primary">Lưu tất cả thay đổi</Button>
      </div>
    </div>
  );
};

export default ShippingSettings;
