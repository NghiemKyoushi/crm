// "use client";

// import { useState } from "react";
// import SalesList from "./sales-list";
// import SalesDetail from "./sales-detail";

// export default function SalesPage() {
//   const [selectedSales, setSelectedSales] = useState<number | undefined>(
//     undefined
//   );
//   const [nameSelect, setNameSelect] = useState("");
//   return (
//     <div className="p-4 flex gap-4">
//       <div className="w-1/3">
//         <SalesList
//           selected={selectedSales}
//           onSelect={(id: number, name: string) => {
//             setSelectedSales(id);
//             setNameSelect(name);
//           }}
//         />
//       </div>
//       <div className="flex-1">
//         <SalesDetail name={nameSelect} salesId={selectedSales} />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import SalesList from "./sales-list";
import SalesDetail from "./sales-detail";
import { getListSaleStaff } from "../../apis/staff-manage";
import { UserSaleItem } from "@/types/sale-manage";

export default function SalesPage() {
  const [selectedSales, setSelectedSales] = useState<number | undefined>(undefined);
  const [nameSelect, setNameSelect] = useState("");
  const [salesData, setSalesData] = useState<UserSaleItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchSales = async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const res = await getListSaleStaff({
        page: pageNum,
        page_size: 10,
        search: undefined,
      });

      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setSalesData((prev) => (reset ? res.data : [...prev, ...res.data]));
      }
    } finally {
      setLoading(false);
    }
  };

  const refetchSales = async () => {
    await fetchSales(0, true);
  };

  useEffect(() => {
    fetchSales(page);
  }, [page]);

  return (
    <div className="p-4 flex gap-4">
      <div className="w-1/3">
        <SalesList
          data={salesData}
          loading={loading}
          hasMore={hasMore}
          setPage={setPage}
          selected={selectedSales}
          onSelect={(id: number, name: string) => {
            setSelectedSales(id);
            setNameSelect(name);
          }}
          refetchSales={refetchSales}
        />
      </div>
      <div className="flex-1">
        <SalesDetail
          name={nameSelect}
          salesId={selectedSales}
          refetchSales={refetchSales}
        />
      </div>
    </div>
  );
}
