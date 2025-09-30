import { Button, Input, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
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
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

const { Text } = Typography;

export default function CustomerTable() {
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>("");
  const router = useRouter();

  const updateCateMutation = useUpdateCateGoryForEachCus();
  const { data } = useListCustomer({
    page,
    page_size: 10,
    category_id: undefined,
    search: search || undefined,
  });
  // const handleClickPopupdetail = (userId: string) => {
  //   setSelectedId(userId);
  //   setIsOpenDetail(true);
  // };
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
          toast.success(t('customerTable.updateSuccess'));
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
      dataIndex: "group_name",
      key: "group_name",
      render: (_, record) => (
        <>
          <CategorySelect
            value={record.group_id}
            onChange={(e: number) => handleUpdateColor(e, record.user_id)}
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
          {value && value.toLocaleString("vi-VN")}
        </Text>
      ),
    },
    {
      title: t("customerTable.actions"),
      key: "actions",
      render: (_: any, record: CustomerModel) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            router.push(`user-management/${record.user_id.toString()}`);
          }}
        >
          <div className="text-blue-600 hover:underline">
            {t("customerTable.view360")}
          </div>
        </div>
      ),
    },
  ];

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleSearch = () => {
    setPage(0);
    queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">
        {t("customerManage.title")}
      </h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder={t('customerTable.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faSearch} />}
          onClick={handleSearch}
        >
          {t("customerManage.search")}
        </Button>
      </div>
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
