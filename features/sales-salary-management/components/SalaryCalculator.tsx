"use client";

import React, { useState } from "react";
import { CalculatorOutlined } from "@ant-design/icons";

// Define salary levels data
const salaryLevels = [
    {
        level: "SALE Mới",
        minSales: 100,
        commission: 0,
        serviceFee: 300,
        shippingFee: 0,
    },
    {
        level: "SALE Level 1",
        minSales: 200,
        commission: 14,
        serviceFee: 350,
        shippingFee: 1260,
    },
    {
        level: "SALE Level 2",
        minSales: 300,
        commission: 16,
        serviceFee: 500,
        shippingFee: 1440,
    },
    {
        level: "SALE Level 3",
        minSales: 400,
        commission: 18,
        serviceFee: 650,
        shippingFee: 1620,
    },
    {
        level: "SALE Level 4",
        minSales: 500,
        commission: 20,
        serviceFee: 800,
        shippingFee: 1800,
    },
];

const BASE_SALARY = 6700000;
const EXCHANGE_RATE = 186;

export default function SalaryCalculator() {
    const [sales, setSales] = useState(0);
    const [weight, setWeight] = useState(0);
    const [result, setResult] = useState({
        level: "-",
        baseSalary: BASE_SALARY,
        commission: 0,
        totalSalary: BASE_SALARY,
    });

    const calculateSalary = () => {
        // Find appropriate level based on sales
        let currentLevel = salaryLevels[0];
        for (let i = salaryLevels.length - 1; i >= 0; i--) {
            if (sales >= salaryLevels[i].minSales) {
                currentLevel = salaryLevels[i];
                break;
            }
        }

        // Calculate revenue in VND
        const revenueVND = sales * EXCHANGE_RATE;

        // Calculate commission
        const commissionAmount = (revenueVND * currentLevel.commission) / 100;

        // Calculate total salary
        const totalSalary = BASE_SALARY + commissionAmount;

        setResult({
            level: currentLevel.level,
            baseSalary: BASE_SALARY,
            commission: commissionAmount,
            totalSalary: totalSalary,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <CalculatorOutlined className="mr-2" />
                Máy tính Lương
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doanh số tháng (¥)
                    </label>
                    <input
                        type="number"
                        value={sales || ""}
                        onChange={(e) => setSales(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trọng lượng hàng (kg)
                    </label>
                    <input
                        type="number"
                        value={weight || ""}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập trọng lượng..."
                    />
                </div>

                <button
                    onClick={calculateSalary}
                    className="w-full bg-blue-600 hover:bg-blue-700 !text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                    <CalculatorOutlined className="mr-2" />
                    Tính Lương
                </button>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                        Kết quả tính toán:
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Cấp bậc:</span>
                            <span className="font-semibold">{result.level}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Lương cơ bản:</span>
                            <span className="font-semibold">
                                {formatCurrency(result.baseSalary)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Hoa hồng:</span>
                            <span className="font-semibold text-green-600">
                                {formatCurrency(result.commission)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-semibold">Tổng lương:</span>
                            <span className="font-bold text-blue-600">
                                {formatCurrency(result.totalSalary)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

