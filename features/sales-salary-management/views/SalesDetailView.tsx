"use client";

import React from "react";
import SalesDetailHeader from "../components/SalesDetailHeader";
import SalesDetailSummary from "../components/SalesDetailSummary";
import SalesDetailTable from "../components/SalesDetailTable";

export default function SalesDetailView() {
  return (
    <div className="container mx-auto px-4 py-6">
      <SalesDetailHeader
        saleName="PHƯƠNG LINH"
        currentMonth="Tháng hiện tại"
        totalRevenue={437185422}
        commission={87437084}
        commissionRate={20}
      />

      <SalesDetailSummary
        totalCustomers={34}
        totalKg={298.7}
        totalRevenueYen={2350445}
        estimatedCommission={87437086}
      />

      <SalesDetailTable />
    </div>
  );
}

