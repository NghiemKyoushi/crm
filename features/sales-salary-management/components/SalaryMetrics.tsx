"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMoneyBillWave,
    faExchangeAlt,
    faWeight,
    faPercentage,
} from "@fortawesome/free-solid-svg-icons";

export default function SalaryMetrics() {
    return (
        <div className="p-6 border-b border-gray-200 bg-white rounded-lg shadow-sm" >
            <h1 className="text-2xl font-bold text-gray-800">
                QUẢN LÝ TÍNH LƯƠNG BỘ PHẬN SALE STREAMCARGO
            </h1>
            <p className="text-gray-600 mt-2">
                Hệ thống tính toán lương và hoa hồng dựa trên doanh số bán hàng
            </p>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <FontAwesomeIcon
                            icon={faMoneyBillWave}
                            className="text-blue-600 text-2xl mr-3"
                        />
                        <div>
                            <p className="text-sm text-gray-600">Lương cơ bản</p>
                            <p className="text-xl font-bold text-blue-600">6,700,000 ₫</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <FontAwesomeIcon
                            icon={faExchangeAlt}
                            className="text-green-600 text-2xl mr-3"
                        />
                        <div>
                            <p className="text-sm text-gray-600">Tỷ giá bình quân</p>
                            <p className="text-xl font-bold text-green-600">186 ₫/¥</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <FontAwesomeIcon
                            icon={faWeight}
                            className="text-purple-600 text-2xl mr-3"
                        />
                        <div>
                            <p className="text-sm text-gray-600">Lợi nhuận/kg</p>
                            <p className="text-xl font-bold text-purple-600">9,000 ₫</p>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <FontAwesomeIcon
                            icon={faPercentage}
                            className="text-orange-600 text-2xl mr-3"
                        />
                        <div>
                            <p className="text-sm text-gray-600">Hoa hồng tối đa</p>
                            <p className="text-xl font-bold text-orange-600">20%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

