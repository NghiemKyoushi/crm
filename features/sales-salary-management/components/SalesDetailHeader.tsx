"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

interface SalesDetailHeaderProps {
  saleName: string;
  currentMonth: string;
  totalRevenue: number;
  commission: number;
  commissionRate: number;
}

export default function SalesDetailHeader({
  saleName,
  currentMonth,
  totalRevenue,
  commission,
  commissionRate,
}: SalesDetailHeaderProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  const handleSaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const saleId = e.target.value;
    router.push(`/sales-salary-management/${saleId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết Doanh số - {saleName}
              </h1>
              <p className="text-gray-600 mt-1">
                Báo cáo chi tiết theo từng khách hàng và lợi nhuận
              </p>

              {/* Sale Selection Dropdown */}
              <div className="mt-3">
                <select
                  onChange={handleSaleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="SALE001"
                >
                  <option value="SALE001">PHƯƠNG LINH</option>
                  <option value="SALE002">NGUYỄN VĂN A</option>
                  <option value="SALE003">TRẦN THỊ B</option>
                </select>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{currentMonth}</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Hoa hồng {commissionRate}%: {formatCurrency(commission)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

