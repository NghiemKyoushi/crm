"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTable,
    faFileExcel,
    faCalculator,
} from "@fortawesome/free-solid-svg-icons";

interface CustomerDetail {
    customerId: string;
    kg: number;
    serviceFee: number;
    totalPayment: number;
    shippingProfit: number;
    paymentFeeProfit: number;
    exchangeRateProfit: number;
    total: number;
    status: "active" | "inactive" | "vip";
}

const sampleData: CustomerDetail[] = [
    {
        customerId: "SC247",
        kg: 0,
        serviceFee: 0,
        totalPayment: 0,
        shippingProfit: 0,
        paymentFeeProfit: 0,
        exchangeRateProfit: 0,
        total: 0,
        status: "inactive",
    },
    {
        customerId: "SC208",
        kg: 0,
        serviceFee: 0,
        totalPayment: 0,
        shippingProfit: 0,
        paymentFeeProfit: 0,
        exchangeRateProfit: 0,
        total: 0,
        status: "inactive",
    },
    {
        customerId: "SC191",
        kg: 2.4,
        serviceFee: 2333,
        totalPayment: 77760,
        shippingProfit: 52800,
        paymentFeeProfit: 438659,
        exchangeRateProfit: 657228,
        total: 15492624,
        status: "active",
    },
    {
        customerId: "SC231",
        kg: 55.5,
        serviceFee: 1003,
        totalPayment: 33420,
        shippingProfit: 4400,
        paymentFeeProfit: 188489,
        exchangeRateProfit: 703048,
        total: 10931449,
        status: "active",
    },
    {
        customerId: "SC168",
        kg: 3.3,
        serviceFee: 0,
        totalPayment: 594025,
        shippingProfit: 72600,
        paymentFeeProfit: 0,
        exchangeRateProfit: 7070272,
        total: 111021778,
        status: "vip",
    },
];

export default function SalesDetailTable() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Hoạt động
                    </span>
                );
            case "vip":
                return (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        VIP
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
                        Không hoạt động
                    </span>
                );
        }
    };

    // Calculate totals
    const totals = sampleData.reduce(
        (acc, item) => ({
            kg: acc.kg + item.kg,
            serviceFee: acc.serviceFee + item.serviceFee,
            totalPayment: acc.totalPayment + item.totalPayment,
            total: acc.total + item.total,
        }),
        { kg: 0, serviceFee: 0, totalPayment: 0, total: 0 }
    );

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                        <FontAwesomeIcon icon={faTable} className="mr-2" />
                        Chi tiết Doanh số theo Khách hàng
                    </h3>
                    <div className="flex space-x-2 gap-2">
                        <button className="bg-green-600 hover:bg-green-700 !text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                            Xuất Excel
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 !text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            <FontAwesomeIcon icon={faCalculator} className="mr-2" />
                            Tính lương
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left font-semibold sticky left-0 bg-gray-100 z-10">
                                    Mã KH
                                </th>
                                <th className="p-3 text-center font-semibold">KG</th>
                                <th className="p-3 text-center font-semibold">Phí DV (¥)</th>
                                <th className="p-3 text-center font-semibold">Tổng TT (¥)</th>
                                <th className="p-3 text-right font-semibold">Lợi nhuận VC</th>
                                <th className="p-3 text-right font-semibold">
                                    Lợi nhuận Phí TT
                                </th>
                                <th className="p-3 text-right font-semibold">
                                    Lợi nhuận Tỷ giá
                                </th>
                                <th className="p-3 text-right font-semibold bg-yellow-50">
                                    Total
                                </th>
                                <th className="p-3 text-center font-semibold">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sampleData.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`${item.status === "inactive"
                                        ? "bg-gray-50 opacity-60"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <td
                                        className={`p-3 font-semibold sticky left-0 z-10 ${item.status === "inactive" ? "bg-gray-50" : "bg-white"
                                            }`}
                                    >
                                        {item.customerId}
                                    </td>
                                    <td className="p-3 text-center">{item.kg}</td>
                                    <td className="p-3 text-center">
                                        ¥{item.serviceFee.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-center">
                                        ¥{item.totalPayment.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right">
                                        {formatCurrency(item.shippingProfit)}
                                    </td>
                                    <td className="p-3 text-right">
                                        {formatCurrency(item.paymentFeeProfit)}
                                    </td>
                                    <td className="p-3 text-right">
                                        {formatCurrency(item.exchangeRateProfit)}
                                    </td>
                                    <td
                                        className={`p-3 text-right font-bold bg-yellow-50 ${item.total > 0 ? "text-green-600" : "text-gray-400"
                                            }`}
                                    >
                                        {formatCurrency(item.total)}
                                    </td>
                                    <td className="p-3 text-center">
                                        {getStatusBadge(item.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-600">Tổng KG:</p>
                            <p className="text-xl font-bold text-blue-600">{totals.kg}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Tổng Phí DV:</p>
                            <p className="text-xl font-bold text-green-600">
                                ¥{totals.serviceFee.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Tổng Thanh toán:</p>
                            <p className="text-xl font-bold text-purple-600">
                                ¥{totals.totalPayment.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Tổng Lợi nhuận:</p>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(totals.total)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

