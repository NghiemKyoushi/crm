"use client";

import React from "react";
import { LineChartOutlined } from "@ant-design/icons";

const salaryLevels = [
  {
    level: "SALE Mới",
    minSales: "100",
    salesVND: "18,600 ₫",
    salaryIndex: "2%",
    commission: "0%",
    serviceFee: "300 ₫",
    shippingFee: "Không có",
    bgColor: "bg-white",
    textColor: "text-gray-600",
    commissionBg: "bg-red-100",
    commissionText: "text-red-800",
  },
  {
    level: "SALE Level 1",
    minSales: "200",
    salesVND: "938,000 ₫",
    salaryIndex: "50%",
    commission: "14%",
    serviceFee: "350 ₫",
    shippingFee: "1,260 ₫",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    salesVNDColor: "text-blue-600",
    commissionBg: "bg-blue-100",
    commissionText: "text-blue-800",
  },
  {
    level: "SALE Level 2",
    minSales: "300",
    salesVND: "1,072,000 ₫",
    salaryIndex: "50%",
    commission: "16%",
    serviceFee: "500 ₫",
    shippingFee: "1,440 ₫",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    salesVNDColor: "text-green-600",
    commissionBg: "bg-green-100",
    commissionText: "text-green-800",
  },
  {
    level: "SALE Level 3",
    minSales: "400",
    salesVND: "1,206,000 ₫",
    salaryIndex: "50%",
    commission: "18%",
    serviceFee: "650 ₫",
    shippingFee: "1,620 ₫",
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
    salesVNDColor: "text-purple-600",
    commissionBg: "bg-purple-100",
    commissionText: "text-purple-800",
  },
  {
    level: "SALE Level 4",
    minSales: "500",
    salesVND: "1,340,000 ₫",
    salaryIndex: "50%",
    commission: "20%",
    serviceFee: "800 ₫",
    shippingFee: "1,800 ₫",
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    salesVNDColor: "text-orange-600",
    commissionBg: "bg-orange-100",
    commissionText: "text-orange-800",
  },
];

export default function SalaryTable() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        <LineChartOutlined className="mr-2" />
        Bảng Tính Lương Theo Cấp Bậc
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold">Cấp bậc</th>
              <th className="p-3 text-center font-semibold">
                Doanh số tối thiểu (¥)
              </th>
              <th className="p-3 text-center font-semibold">Doanh số VND</th>
              <th className="p-3 text-center font-semibold">
                Chỉ số tính lương
              </th>
              <th className="p-3 text-center font-semibold">% Hoa hồng</th>
              <th className="p-3 text-center font-semibold">Phí dịch vụ</th>
              <th className="p-3 text-center font-semibold">
                Phí vận chuyển/kg
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {salaryLevels.map((level, index) => (
              <tr key={index} className={level.bgColor}>
                <td className={`p-3 font-medium ${level.textColor}`}>
                  {level.level}
                </td>
                <td className="p-3 text-center font-bold">{level.minSales}</td>
                <td
                  className={`p-3 text-center font-semibold ${
                    level.salesVNDColor || "text-gray-800"
                  }`}
                >
                  {level.salesVND}
                </td>
                <td className="p-3 text-center">{level.salaryIndex}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 ${level.commissionBg} ${level.commissionText} rounded-full text-xs font-semibold`}
                  >
                    {level.commission}
                  </span>
                </td>
                <td className="p-3 text-center">{level.serviceFee}</td>
                <td className="p-3 text-center">{level.shippingFee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Ghi chú:</strong>
        </p>
        <ul className="list-disc list-inside mt-1">
          <li>Chỉ số tính lương tối đa 20% doanh thu</li>
          <li>Phí dịch vụ: 2-5% giá trị đơn hàng</li>
          <li>Phí thanh toán bên Nhật: 14-20% tùy cấp bậc</li>
        </ul>
      </div>
    </div>
  );
}

