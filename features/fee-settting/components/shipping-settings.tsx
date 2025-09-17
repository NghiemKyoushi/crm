"use client";

import React, { useState } from "react";
import { Checkbox, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faFlag, faLocationDot, faPhone } from "@fortawesome/free-solid-svg-icons";

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
        {
          key: "air",
          name: "Đường hàng không (Air)",
          time: "7-10 ngày",
          checked: true,
        },
        {
          key: "sea",
          name: "Đường biển (Sea)",
          time: "20-25 ngày",
          checked: true,
        },
      ],
    },
    {
      country: "Hoa Kỳ",
      code: "US",
      flag: faFlag,
      color: "#dc2626",
      bgColor: "#fef2f2",
      options: [
        {
          key: "air",
          name: "Đường hàng không (Air)",
          time: "10-14 ngày",
          checked: true,
        },
        {
          key: "sea",
          name: "Đường biển (Sea)",
          disabled: true,
          note: "Hiện tại không hỗ trợ đường biển từ Mỹ",
          checked: false,
        },
      ],
    },
  ]);

  const handleOptionChange = (
    countryCode: string,
    key: string,
    checked: boolean
  ) => {
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
      <h3 className="text-lg font-semibold">Cài đặt Đường vận chuyển Dream Cargo</h3>
      <div className="bg-green-50 p-4 rounded-lg border border-l-4 border-green-200">
        <div className="font-semibold text-green-700 flex items-center gap-2 mb-2">
          <FontAwesomeIcon icon={faPhone} />
          Thông tin Liên hệ Dream Cargo
        </div>
        <p className="text-green-700 text-sm flex items-center gap-2 !mb-1">
          <FontAwesomeIcon icon={faLocationDot} className="text-green-600" />
          N02-T3 Khu Ngoại Giao Đoàn, Xuân Tảo, Bắc Từ Liêm, Hà Nội
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-green-600 !mb-1">Hotline</p>
            <div className="text-green-600 border border-gray-300 rounded p-2 bg-white">096.55.44444</div>
          </div>
          <div>
            <p className="text-gray-600 !mb-1">Zalo</p>
            <div className="text-green-600 border border-gray-300  rounded p-2 bg-white">097.11.68686</div>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        {countries.map((c) => (
          <div
            key={c.code}
            className="rounded-lg p-4 flex-1"
            style={{ backgroundColor: c.bgColor }}
          >
            <div
              className="font-semibold mb-3 flex items-center gap-2"
              style={{ color: c.color }}
            >
              <FontAwesomeIcon icon={c.flag} />
              {c.country} ({c.code})
            </div>
            <div className="space-y-1">
              {c.options.map((opt) => (
                <div key={opt.key}>
                  <Checkbox
                    checked={opt.checked}
                    disabled={opt.disabled}
                    onChange={(e) =>
                      handleOptionChange(c.code, opt.key, e.target.checked)
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{opt.name}</span>
                      {opt.time && (
                        <span className="text-gray-500 text-xs">
                          Thời gian: {opt.time}
                        </span>
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

      {/* Box quy định vận chuyển */}
      <div className="flex gap-3 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
        <FontAwesomeIcon
          icon={faExclamationCircle}
          className="text-yellow-600 text-lg mt-1"
        />
        <div>
          <h4 className="font-semibold text-yellow-700 mb-1">
            Quy định Vận chuyển
          </h4>
          <ul className="text-yellow-700 text-sm list-disc pl-0 space-y-1 text-sm text-gray-700">
            <li>
              <strong>Kho Mỹ:</strong> Chỉ sử dụng kho Oregon/New Hampshire. Không sử dụng
              kho Texas/California
            </li>
            <li>
              <strong>Giao hàng:</strong> Chỉ giao hàng trực tiếp tại nội thành Hà Nội.
              Không giao hàng tại TP.HCM
            </li>
            <li>
              <strong>Trách nhiệm:</strong> Chỉ tính từ khi đối tác về đến kho tại Hà Nội
            </li>
            <li>
              <strong>Không COD và bảo hiểm:</strong> Đơn hàng qua GHTK, GHN và Hà Nội
            </li>
          </ul>
        </div>
      </div>

      <div className="text-right mt-4">
        <Button type="primary">Lưu tất cả thay đổi</Button>
      </div>
    </div>
  );
};

export default ShippingSettings;
