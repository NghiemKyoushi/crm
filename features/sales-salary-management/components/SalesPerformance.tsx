"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faPlus } from "@fortawesome/free-solid-svg-icons";

interface SalesPerson {
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
    monthlySales: number;
    level: string;
    levelBadgeColor: string;
    commission: number;
    totalSalary: number;
    status: "active" | "warning";
}

const salesData: SalesPerson[] = [
    {
        id: "SALE001",
        name: "Nguyễn Văn A",
        initials: "NV",
        avatarColor: "bg-blue-500",
        monthlySales: 850,
        level: "Level 4",
        levelBadgeColor: "bg-orange-100 text-orange-800",
        commission: 3162000,
        totalSalary: 9862000,
        status: "active",
    },
    {
        id: "SALE002",
        name: "Trần Thị B",
        initials: "TB",
        avatarColor: "bg-green-500",
        monthlySales: 420,
        level: "Level 3",
        levelBadgeColor: "bg-purple-100 text-purple-800",
        commission: 1409760,
        totalSalary: 8109760,
        status: "active",
    },
    {
        id: "SALE003",
        name: "Lê Văn C",
        initials: "LC",
        avatarColor: "bg-purple-500",
        monthlySales: 180,
        level: "Chưa đạt",
        levelBadgeColor: "bg-red-100 text-red-800",
        commission: 0,
        totalSalary: 6700000,
        status: "warning",
    },
];

export default function SalesPerformance() {
    const router = useRouter();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
    };

    const handleViewDetail = (saleId: string) => {
        router.push(`/sales-salary-management/${saleId}`);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                    <FontAwesomeIcon icon={faUsers} className="mr-2" />
                    Theo dõi Hiệu suất Sale
                </h3>
                <button className="bg-blue-600 hover:bg-blue-700 !text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Thêm Sale
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left font-semibold">Tên Sale</th>
                            <th className="p-3 text-center font-semibold">
                                Doanh số tháng (¥)
                            </th>
                            <th className="p-3 text-center font-semibold">Cấp bậc</th>
                            <th className="p-3 text-center font-semibold">
                                Hoa hồng ước tính
                            </th>
                            <th className="p-3 text-center font-semibold">Tổng lương</th>
                            <th className="p-3 text-center font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {salesData.map((sale) => (
                            <tr key={sale.id}>
                                <td className="p-3">
                                    <div className="flex items-center">
                                        <div
                                            className={`w-8 h-8 ${sale.avatarColor} rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3`}
                                        >
                                            {sale.initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{sale.name}</p>
                                            <p className="text-xs text-gray-500">ID: {sale.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 text-center font-semibold text-green-600">
                                    {sale.monthlySales}
                                </td>
                                <td className="p-3 text-center">
                                    <span
                                        className={`px-2 py-1 ${sale.levelBadgeColor} rounded-full text-xs font-semibold`}
                                    >
                                        {sale.level}
                                    </span>
                                </td>
                                <td
                                    className={`p-3 text-center font-semibold ${sale.commission > 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {formatCurrency(sale.commission)}
                                </td>
                                <td className="p-3 text-center font-bold text-blue-600">
                                    {formatCurrency(sale.totalSalary)}
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleViewDetail(sale.id)}
                                            className="!text-blue-600 !hover:text-blue-700 hover:underline  px-3 py-1 rounded text-xs transition-colors"
                                        >
                                            Chi tiết
                                        </button>
                                        {sale.status === "active" ? (
                                            <button className="!text-green-600 !hover:text-green-700 hover:underline px-3 py-1 rounded text-xs transition-colors">
                                                Tính lương
                                            </button>
                                        ) : (
                                            <button className="!text-yellow-500 !hover:text-yellow-600 hover:underline px-3 py-1 rounded text-xs transition-colors">
                                                Cảnh báo
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

