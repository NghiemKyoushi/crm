import { Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import CustomerRowActions from "./customer-row-actions";
import TableComponent from "@/components/TableComponent";
import CustomerDetailModal from "./modal-customer/modal-view-detail-customer";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useListCustomer,
  useUpdateCateGoryForEachCus,
} from "../../hooks/staff-manage";
import { CustomerModel } from "@/types/customer-type";
import CategorySelect from "./customer-type-select";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const { Text } = Typography;

export default function CustomerTable() {
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateCateMutation = useUpdateCateGoryForEachCus();
  const { data } = useListCustomer({
    page,
    page_size: 10,
    category_id: undefined,
    search: undefined,
  });
  const handleClickPopupdetail = (userId: string) => {
    setSelectedId(userId);
    setIsOpenDetail(true);
  };
  const handleClosePopupdetail = () => {
    setSelectedId(null);
    setIsOpenDetail(false);
  };

  const handleUpdateColor = (e: number, userId: number) => {    
    updateCateMutation.mutate(
      {
        category_id: e,
        id: userId,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật phân loại thành công!");
          queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  const columns: ColumnsType<CustomerModel> = [
    {
      title: t("customerTable.name"),
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: t("customerTable.type"),
      dataIndex: "category_name",
      key: "category_name",
      render: (_, record) => (
        <>
          <CategorySelect
            value={record.category_id}
            onChange={(e: number) =>
              handleUpdateColor(e, record.user_id)
            }
          />
        </>
      ),
    },
    {
      title: t("customerTable.sales"),
      dataIndex: "sale_name",
      key: "sale_name",
    },
    {
      title: t("customerTable.debt"),
      dataIndex: "debt_amount",
      key: "debt_amount",
      render: (value) => (
        <Text className={value > 0 ? "text-red-500 font-semibold" : ""}>
          {value.toLocaleString("vi-VN")}
        </Text>
      ),
    },
    {
      title: t("customerTable.actions"),
      key: "actions",
      render: (_: any, record: CustomerModel) => (
        <div
          className="cursor-pointer"
          onClick={() => handleClickPopupdetail(record.user_id.toString())}
        >
          <CustomerRowActions />
        </div>
      ),
    },
  ];

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Danh sách Khách hàng</h2>
      <TableComponent
        columns={columns}
        dataSource={data?.data || []}
        rowHeight={48}
        pageSize={5}
        page={data?.current_page || 0}
        onPageChange={handleChangePage}
        response={data}
        fontSize={14}
        headerHeight={44}
      />
      {selectedId && (
        <CustomerDetailModal
          selectedId={selectedId}
          onClose={handleClosePopupdetail}
          visible={isOpenDetail}
        />
      )}
    </div>
  );
}
