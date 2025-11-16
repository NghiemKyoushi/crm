"use client";

import React from "react";
import SalaryMetrics from "../components/SalaryMetrics";
import SalaryTable from "../components/SalaryTable";
import SalaryCalculator from "../components/SalaryCalculator";
import SalesPerformance from "../components/SalesPerformance";

export default function SalesSalaryManagementView() {
    return (
        <div className="pt-4 space-y-6">
            <SalaryMetrics />

            {/* Layout 7:3 for Table and Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-7 space-y-6">
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

