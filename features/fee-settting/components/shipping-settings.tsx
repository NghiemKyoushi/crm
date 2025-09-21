"use client";

import React, { useEffect, useState } from "react";
import { Checkbox, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faFlag,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { useListFeeShippingDefault } from "../hooks/fee-setting";
import { ShippingMethod, ShippingMethodResponse } from "@/types/fee-setting";

const ShippingSettings: React.FC = () => {
  const [regions, setRegions] = useState<
    { region_code: string; region_name: string; methods: (ShippingMethod & { checked: boolean })[] }[]
  >([]);

  const { data: shippingMethods } = useListFeeShippingDefault();

  useEffect(() => {
    if (shippingMethods) {
      const mapped = Object.entries(shippingMethods).map(([regionCode, methods]) => ({
        region_code: regionCode,
        region_name: (methods as ShippingMethod[])[0]?.region_name || regionCode,
        methods: (methods as ShippingMethod[]).map((m) => ({
          ...m,
          checked: !m.disable, // mặc định tick nếu ko disable
        })),
      }));
      setRegions(mapped);
    }
  }, [shippingMethods]);

  const handleOptionChange = (regionCode: string, id: number, checked: boolean) => {
    setRegions((prev) =>
      prev.map((region) =>
        region.region_code === regionCode
          ? {
              ...region,
              methods: region.methods.map((m) =>
                m.id === id ? { ...m, checked } : m
              ),
            }
          : region
      )
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Cài đặt Đường vận chuyển Dream Cargo</h3>

      {/* Box thông tin liên hệ */}
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
            <div className="text-green-600 border border-gray-300 rounded p-2 bg-white">
              096.55.44444
            </div>
          </div>
          <div>
            <p className="text-gray-600 !mb-1">Zalo</p>
            <div className="text-green-600 border border-gray-300 rounded p-2 bg-white">
              097.11.68686
            </div>
          </div>
        </div>
      </div>

      {/* Render regions */}
      <div className="flex gap-4 flex-wrap">
        {regions.map((region) => (
          <div
            key={region.region_code}
            className="rounded-lg p-4 flex-1 bg-white shadow"
            style={{ backgroundColor: region.region_name === "JP -> VN" ? '#eff6ff' : "#fef2f2"}}
          > 
            <div className="font-semibold mb-3" style={{color: region.region_name === "JP -> VN" ? '#1d4ed8' : "#dc2626"}}> <FontAwesomeIcon icon={faFlag} />
            {region.region_name}</div>
            <div className="space-y-2">
              {region.methods.map((method) => (
                <div key={method.id}>
                  <Checkbox
                    checked={method.supported}
                    disabled={!method.supported}
                    onChange={(e) =>
                      handleOptionChange(region.region_code, method.id, e.target.checked)
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{method.method_type}</span>
                      {method.duration_min !== null && (
                        <span className="text-gray-500 text-xs">
                          Thời gian: {method.duration_min}
                          {method.duration_max ? ` - ${method.duration_max}` : ""} ngày
                        </span>
                      )}
                    </div>
                  </Checkbox>
                  <div className="text-gray-600 text-xs ml-6" style={{color: region.region_name === "JP -> VN" ? '#1d4ed8' : "#dc2626"}}>{method.description}</div>
                  {!method.supported && (
                    <div className="text-gray-500 text-sm ml-6">Không hỗ trợ</div>
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
          <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700">
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
