'use client';

import { useState } from 'react';
import SalesList from './sales-list';
import SalesDetail from './sales-detail';

export default function SalesPage() {
  const [selectedSales, setSelectedSales] = useState<string>('tran-thi-bich');

  return (
    <div className="p-4 flex gap-4">
      <div className="w-1/3">
        <SalesList selected={selectedSales} onSelect={setSelectedSales} />
      </div>
      <div className="flex-1">
        <SalesDetail salesId={selectedSales} />
      </div>
    </div>
  );
}
