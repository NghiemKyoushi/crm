"use client";

import React from "react";
import SalaryMetrics from "../components/SalaryMetrics";
import SalaryTable from "../components/SalaryTable";
import SalaryCalculator from "../components/SalaryCalculator";
import SalesPerformance from "../components/SalesPerformance";

export default function SalesSalaryManagementView() {
    return (
        <div className="bg-white min-h-full p-4 space-y-4">
            <SalaryMetrics />

            {/* Layout 7:3 for Table and Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                <div className="lg:col-span-7 space-y-4">
                    <SalaryTable />
                    <SalesPerformance />
                </div>
                <div className="lg:col-span-3">
                    <SalaryCalculator />
                </div>
            </div>
        </div>
    );
}

