"use client";

import { useState } from "react";
import SalesList from "./sales-list";
import SalesDetail from "./sales-detail";

export default function SalesPage() {
  const [selectedSales, setSelectedSales] = useState<number | undefined>(
    undefined
  );
  const [nameSelect, setNameSelect] = useState("");
  return (
    <div className="p-4 flex gap-4">
      <div className="w-1/3">
        <SalesList
          selected={selectedSales}
          onSelect={(id: number, name: string) => {
            setSelectedSales(id);
            setNameSelect(name);
          }}
        />
      </div>
      <div className="flex-1">
        <SalesDetail name={nameSelect} salesId={selectedSales} />
      </div>
    </div>
  );
}
