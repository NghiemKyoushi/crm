"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faWeight,
  faYenSign,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

interface SalesDetailSummaryProps {
  totalCustomers: number;
  totalKg: number;
  totalRevenueYen: number;
  estimatedCommission: number;
}

export default function SalesDetailSummary({
  totalCustomers,
  totalKg,
  totalRevenueYen,
  estimatedCommission,
}: SalesDetailSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Tổng khách hàng</p>
            <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <FontAwesomeIcon
              icon={faWeight}
              className="text-green-600 text-xl"
            />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Tổng KG</p>
            <p className="text-2xl font-bold text-gray-800">{totalKg}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <FontAwesomeIcon
              icon={faYenSign}
              className="text-yellow-600 text-xl"
            />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Tổng doanh thu (¥)</p>
            <p className="text-2xl font-bold text-gray-800">
              ¥{totalRevenueYen.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <FontAwesomeIcon
              icon={faChartLine}
              className="text-purple-600 text-xl"
            />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Hoa hồng ước tính</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(estimatedCommission)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

