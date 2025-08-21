import { Button, List, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import AddSalesModal from "./modal-sales-add";
import { getListSaleStaff } from "../../apis/staff-manage";
import { UserSaleItem } from "@/types/sale-manage";

interface SalesListProps {
  selected: number;
  onSelect: (id: number) => void;
}

export default function SalesList({ selected, onSelect }: SalesListProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [salesData, setSalesData] = useState<UserSaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const listRef = useRef<HTMLDivElement | null>(null);

  const fetchSales = async (pageNum: number) => {
    setLoading(true);
    try {
      // 🔥 call API
      const res = await getListSaleStaff({
        page: pageNum,
        page_size: 10,
        search: undefined,
      });

      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setSalesData((prev) => [...prev, ...res.data]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(page);
  }, [page]);

  // detect scroll bottom
  const handleScroll = () => {
    if (!listRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Nhân viên Sales</h3>
        <Button type="primary" onClick={() => setOpen(true)}>
          + Thêm
        </Button>
      </div>

      <div
        ref={listRef}
        className="max-h-[400px] overflow-y-auto"
        onScroll={handleScroll}
      >
        <List
          itemLayout="vertical"
          dataSource={salesData}
          renderItem={(item) => (
            <List.Item
              onClick={() => onSelect(item.user_id)}
              className={`cursor-pointer rounded !p-4 border-l-4 ${
                selected === item.user_id
                  ? "bg-blue-100 border-blue-500"
                  : "border-transparent"
              }`}
            >
              <div
                className={`${
                  selected === item.user_id ? "text-blue-700" : ""
                } font-bold`}
              >
                {item.full_name}
              </div>
              <div className="text-gray-500 text-sm">
                Đang quản lý ... Khách hàng
              </div>
            </List.Item>
          )}
        />

        {loading && (
          <div className="text-center p-2">
            <Spin />
          </div>
        )}
        {!hasMore && (
          <div className="text-center text-gray-400 text-sm p-2">
            Hết dữ liệu
          </div>
        )}
      </div>
    </div>
  );
}
