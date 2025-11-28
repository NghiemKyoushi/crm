import { Button, List, Spin } from "antd";
import { useState, useRef } from "react";
import AddSalesModal, { Employee } from "./modal-sales-add";
import { useCreateSaleStaff } from "../../hooks/staff-manage";
import { toast } from "react-toastify";
import { UserSaleItem } from "@/types/sale-manage";
import { useTranslation } from "react-i18next";
import { usePermission } from "@/components/layout/PermissionContext";

interface SalesListProps {
  data: UserSaleItem[];
  loading: boolean;
  hasMore: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  selected?: number;
  onSelect: (id: number, name: string) => void;
  refetchSales: () => void;
}

export default function SalesList({ data, loading, hasMore, setPage, selected, onSelect, refetchSales }: SalesListProps) {
  const { t } = useTranslation();  
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const createNewSaleMutation = useCreateSaleStaff();

  const handleScroll = () => {
    if (!listRef.current || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSubmit = (data: Employee[]) => {
    const listId: string[] = data.map((item) => item.id.toString());
    createNewSaleMutation.mutate(listId, {
      onSuccess: () => {
        toast.success(t('salesManage.addSuccess'));
        refetchSales()
      },
      onError: () => {
        toast.error(t('salesManage.addFailed'));
      },
    });
    setOpen(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm text-gray-800">{t('salesManage.title')}</h3>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('salesManage.addButton')}
        </Button>
      </div>

      <div ref={listRef} className="max-h-[300px] overflow-y-auto" onScroll={handleScroll}>
        <List
          itemLayout="vertical"
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              onClick={() => onSelect(item.user_id, item.full_name)}
              className={`cursor-pointer rounded !p-3 border-l-4 transition-colors ${
                selected === item.user_id
                  ? "bg-blue-50 border-blue-500"
                  : "border-transparent hover:bg-gray-50"
              }`}
            >
              <div className={`text-sm ${selected === item.user_id ? "text-blue-700" : "text-gray-800"}`}>
                {item.full_name}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {t('salesManage.managingCustomers', { count: item.total })}
              </div>
            </List.Item>
          )}
        />
        {loading && <div className="text-center p-2"><Spin size="small" /></div>}
        {!hasMore && <div className="text-center text-gray-400 text-xs p-2">{t('salesManage.noMoreData')}</div>}
      </div>
      <AddSalesModal onClose={() => setOpen(false)} open={open} onSubmit={handleSubmit} />
    </div>
  );
}
