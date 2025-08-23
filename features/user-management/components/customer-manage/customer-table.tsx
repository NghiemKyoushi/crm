import { Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import CustomerRowActions from "./customer-row-actions";
import CustomerTypeSelect from "./customer-type-select";
import TableComponent from "@/components/TableComponent";
import CustomerDetailModal from "./modal-customer/modal-view-detail-customer";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDetailCustomer, useListCustomer } from "../../hooks/staff-manage";
import { CustomerModel } from "@/types/customer-type";

const { Text } = Typography;

export default function CustomerTable() {
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        <CustomerTypeSelect value={record.category_name} />
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    setPage(pageNumber);
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
