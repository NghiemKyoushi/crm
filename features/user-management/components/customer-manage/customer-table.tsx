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
import { usePermission } from "@/components/layout/PermissionContext";

const { Text } = Typography;

export default function CustomerTable() {
  const { hasPermission, permissions } = usePermission();

  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // State to hold current inputs (search box states)
  const [searchNameInput, setSearchNameInput] = useState<string>("");
  const [searchEmailInput, setSearchEmailInput] = useState<string>("");
  const [searchPhoneInput, setSearchPhoneInput] = useState<string>("");

  // State to hold last-submitted search (only call api when set)
  const [searchValues, setSearchValues] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const router = useRouter();

  // Phân quyền chỉ hiển thị nếu có "user.categorize_customers"
  const canShowCategory =
    hasPermission("user.categorize_customers");

  const hasSalesOnly =
    hasPermission("sales.manage_assigned_customers") &&
    permissions.filter((p) =>
      [
        "user.view",
        "role.view",
        "user.categorize_customers",
        "user.manage_staff_roles",
      ].includes(p.name)
    ).length === 0;

  const updateCateMutation = useUpdateCateGoryForEachCus();

  // --- Only call useListCustomer when search is submitted (searchValues state changes) ---
  const { data } = useListCustomer({
    page,
    page_size: 10,
    category_id: undefined,
    search: searchValues.name || undefined,  
    email: searchValues.email || undefined,
    phone_number: searchValues.phone || undefined,
  });

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
            err?.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  // Các cột mặc định
  const baseColumns: ColumnsType<CustomerModel> = [
    {
      title: t("customerTable.name"),
      dataIndex: "full_name",
      key: "full_name",
      width: 200,
      render: (text: string, record: CustomerModel) => (
        <div>
          <div className="text-sm text-gray-800">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: t("staffManage.phone"),
      dataIndex: "phone_number",
      key: "phone_number",
      width: 200,
      render: (_: any, record: CustomerModel) => (
        <div>
          <div className="text-sm text-gray-800">{record.phone_number}</div>
        </div>
      ),
    },
    // Ẩn cột phân loại nếu KHÔNG có quyền user.categorize_customers
    {
      title: t("customerTable.type"),
      dataIndex: "group_name",
      key: "group_name",
      width: 180,
      render: (_: any, record: CustomerModel) => (
        canShowCategory ? (
          <CategorySelect
            value={record.group_id}
            onChange={(e: number) => handleUpdateColor(e, record.user_id)}
          />
        ) : (
          <span>{record.group_name || "-"}</span>
        )
      ),
    },
    {
      title: t("customerTable.sales"),
      dataIndex: "sale_name",
      key: "sale_name",
      width: 150,
      render: (text: string) => (
        <div className="text-sm text-gray-700">{text || "-"}</div>
      ),
    },
    {
      title: t("customerTable.debt"),
      dataIndex: "debt_amount",
      key: "debt_amount",
      width: 140,
      align: "right",
      render: (value: number) => (
        <div className={`text-sm ${value > 0 ? "text-red-600" : "text-gray-700"}`}>
          {value ? `${value.toLocaleString("vi-VN")}đ` : "0đ"}
        </div>
      ),
    },
    {
      title: t("customerTable.actions"),
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_: any, record: CustomerModel) => (
        <Button
          type="link"
          size="small"
          className="!p-0 !h-auto !text-xs"
          onClick={() => {
            router.push(`user-management/${record.user_id.toString()}`);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ].filter(Boolean) as ColumnsType<CustomerModel>;

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleSearch = () => {
    setPage(0);
    setSearchValues({
      name: searchNameInput,
      email: searchEmailInput,
      phone: searchPhoneInput
    });
    // Only do invalidate to force refetch in page = 0 scenario, NOT on keyup/typing!
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
          value={searchNameInput}
          onChange={(e) => setSearchNameInput(e.target.value)}
          allowClear
          className="!h-10"
        />
        <Input
          placeholder={t('customerTable.searchByEmail') || "Email"}
          value={searchEmailInput}
          onChange={(e) => setSearchEmailInput(e.target.value)}
          allowClear
          className="!h-10"
        />
        <Input
          placeholder={t('customerTable.searchByPhonennumber') || "Số điện thoại"}
          value={searchPhoneInput}
          onChange={(e) => setSearchPhoneInput(e.target.value)}
          allowClear
          className="!h-10"
        />
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faSearch} />}
          onClick={handleSearch}
          className="!h-10"
        >
          Tìm kiếm
        </Button>
      </div>
      <div className="overflow-x-auto">
        <TableComponent
          columns={baseColumns}
          dataSource={data?.data || []}
          rowHeight={55}
          pageSize={10}
          page={data?.current_page || 0}
          onPageChange={handleChangePage}
          response={data}
          fontSize={13}
          headerHeight={46}
        />
      </div>
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
