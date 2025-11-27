import { Button, Input, Typography, Select, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import TableComponent from "@/components/TableComponent";
import CustomerDetailModal from "./modal-customer/modal-view-detail-customer";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  useListCateGoryCus,
  useListCustomer,
  useUpdateCateGoryForEachCus,
  useCreateCustomer,
} from "../../hooks/staff-manage";
import { CustomerModel } from "@/types/customer-type";
import CategorySelect from "./customer-type-select";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { usePermission } from "@/components/layout/PermissionContext";
import { getListSaleStaff, CreateCustomerParams } from "../../apis/staff-manage";
import AccountAssignButton from "@/features/user-website-accounts/components/account-assign-button";
import ModalCreateCustomer from "./modal-create-customer";

const { Text } = Typography;
const { Option } = Select;

export default function CustomerTable() {
  // Avoid double execution in StrictMode (dev) or duplicate mount
  const didInit = useRef(false);

  const { hasPermission, permissions } = usePermission();

  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // State inputs cho từng trường tìm kiếm
  const [searchNameInput, setSearchNameInput] = useState<string>("");
  const [searchEmailInput, setSearchEmailInput] = useState<string>("");
  const [searchPhoneInput, setSearchPhoneInput] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<number | undefined>(
    undefined
  );
  const [searchSale, setSearchSale] = useState<number | undefined>(undefined);

  // State lưu lại giá trị đã submit search
  const [searchValues, setSearchValues] = useState<{
    name: string;
    email: string;
    phone: string;
    category: number | undefined;
    sale: number | undefined;
  }>({
    name: "",
    email: "",
    phone: "",
    category: undefined,
    sale: undefined,
  });

  const router = useRouter();

  // Quyền hiển thị cột loại KH
  const canShowCategory = hasPermission("user.categorize_customers");

  // Lấy danh sách sale phụ trách, copy logic từ sales-page.tsx
  const [salesData, setSalesData] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    let unmounted = false;
    const fetchSales = async () => {
      setSalesLoading(true);
      try {
        // import getListSaleStaff from apis/staff-manage
        const res = await getListSaleStaff({
          page: 0,
          page_size: 10, // large enough for select dropdown
          search: undefined,
        });
        if (!unmounted) {
          setSalesData(res.data || []);
        }
      } catch (error) {
        if (!unmounted) setSalesData([]);
      } finally {
        if (!unmounted) setSalesLoading(false);
      }
    };
    fetchSales();
    return () => {
      unmounted = true;
    };
  }, []);

  const saleOptions = salesData.map((sale: any) => ({
    value: sale.user_id,
    label: sale.full_name,
  }));

  const updateCateMutation = useUpdateCateGoryForEachCus();
  const createCustomerMutation = useCreateCustomer();

  // --- API gọi khi search state thay đổi ---
  const { data, isFetching, isPending } = useListCustomer({
    page,
    page_size: 10,
    category_id: searchValues.category || undefined,
    search: searchValues.name || undefined,
    email: searchValues.email || undefined,
    phone_number: searchValues.phone || undefined,
    sale_id: searchValues.sale || undefined,
  });

  const { data: dataSelectCategory, isLoading } = useListCateGoryCus({
    page,
    page_size: 10,
  });

  const categoryOptions =
    dataSelectCategory?.data.map((opt: any) => ({
      key: String(opt.id),
      value: opt.id,
      label: opt.group_name,
      color: opt.color,
      textColor: opt.text_color ?? "#000",
    })) ?? [];
  // console.log('categoryOptions', categoryOptions);

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
          toast.success(t("customerTable.updateSuccess"));
          queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
        },
        onError: (err: any) =>
          toast.error(
            err?.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  // Các cột
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
      title: t("table.customerCode"),
      dataIndex: "customer_code",
      key: "customer_code",
      width: 150,
      render: (text: string, record: CustomerModel) => (
        <div>
          <div className="text-sm text-gray-800">{record.customer_code}</div>
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
    // PHÂN LOẠI khách hàng (filter theo loại KH)
    canShowCategory && {
      title: t("customerTable.type"),
      dataIndex: "group_name",
      key: "group_name",
      width: 180,
      render: (_: any, record: CustomerModel) =>
        canShowCategory ? (
          <CategorySelect
            value={record.group_id}
            onChange={(e: number) => handleUpdateColor(e, record.user_id)}
          />
        ) : (
          <span>{record.group_name || "-"}</span>
        ),
    },
    {
      title: t("customerTable.sales"),
      dataIndex: "sale_name",
      key: "sale_name",
      width: 180,
      render: (_: any, record: CustomerModel) => (
        <div className="text-sm text-gray-700">{record.sale_name || "-"}</div>
      ),
    },
    {
      title: t("customerTable.debt"),
      dataIndex: "debt_amount",
      key: "debt_amount",
      width: 140,
      align: "right",
      render: (value: number) => (
        <div
          className={`text-sm ${value > 0 ? "text-red-600" : "text-gray-700"}`}
        >
          {value ? `${value.toLocaleString("vi-VN")}đ` : "0đ"}
        </div>
      ),
    },
    {
      title: t("customerTable.actions"),
      key: "actions",
      width: 260,
      fixed: "right",
      render: (_: any, record: CustomerModel) => (
        <div className="flex gap-2 items-center">
          <AccountAssignButton userId={record.user_id} />
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
        </div>
      ),
    },
  ].filter(Boolean) as ColumnsType<CustomerModel>;

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  // Cập nhật lại state searchSale khi clear dropdown hoặc chọn giá trị khác
  const handleSearchSaleChange = (value: number | undefined) => {
    setSearchSale(value ?? undefined);
  };

  const handleSearch = () => {
    setPage(0);
    setSearchValues({
      name: searchNameInput,
      email: searchEmailInput,
      phone: searchPhoneInput,
      category: searchCategory,
      sale: searchSale,
    });
    // Chỉ force refetch khi submit search
    queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
  };

  const handleCreateCustomer = (data: CreateCustomerParams) => {
    createCustomerMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Tạo tài khoản khách hàng thành công!");
        queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
        setIsOpenCreateModal(false);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.localizedMessage || 
          err?.response?.data?.message || 
          "Có lỗi xảy ra khi tạo tài khoản"
        );
      },
    });
  };

  // Hiển thị filter/inputs
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {t("customerManage.title")}
        </h2>
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => setIsOpenCreateModal(true)}
          className="bg-blue-500"
        >
          Tạo tài khoản
        </Button>
      </div>
      <div className="mb-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <Input
            placeholder={t("customerTable.searchPlaceholder")}
            value={searchNameInput}
            onChange={(e) => setSearchNameInput(e.target.value)}
            allowClear
            className="!h-10 min-w-[180px]"
          />
          <Input
            placeholder={
              t("customerTable.searchByPhonennumber") || "Số điện thoại"
            }
            value={searchPhoneInput}
            onChange={(e) => setSearchPhoneInput(e.target.value)}
            allowClear
            className="!h-10 min-w-[180px]"
          />
          <Input
            placeholder={t("customerTable.searchByEmail") || "Email"}
            value={searchEmailInput}
            onChange={(e) => setSearchEmailInput(e.target.value)}
            allowClear
            className="!h-10 min-w-[180px]"
          />
          <Select
            placeholder={t("customerTable.selectCategory") || "Loại khách hàng"}
            allowClear
            style={{ minWidth: 180, height: 40 }}
            value={searchCategory}
            onChange={setSearchCategory}
            loading={isLoading}
            className="!h-10"
            options={
              categoryOptions?.map((cat: any) => ({
                value: cat.value,
                label: cat.label,
              })) || []
            }
          />
          <Select
            placeholder={"Sale phụ trách"}
            allowClear
            style={{ minWidth: 180, height: 40 }}
            value={searchSale}
            onChange={handleSearchSaleChange}
            options={saleOptions}
            loading={salesLoading}
            className="!h-10"
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<FontAwesomeIcon icon={faSearch} />}
              onClick={handleSearch}
              className="!h-10 px-5"
              loading={isFetching}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <TableComponent
          columns={baseColumns}
          dataSource={data?.data || []}
          rowHeight={55}
          pageSize={10}
          page={(data?.current_page && data?.current_page + 1)|| 0}
          onPageChange={handleChangePage}
          response={data}
          fontSize={13}
          headerHeight={46}
          loading={isPending}
        />
      </div>
      {selectedId && (
        <CustomerDetailModal
          selectedId={selectedId}
          onClose={handleClosePopupdetail}
          visible={isOpenDetail}
        />
      )}
      <ModalCreateCustomer
        open={isOpenCreateModal}
        onClose={() => setIsOpenCreateModal(false)}
        handleSubmitData={handleCreateCustomer}
      />
    </div>
  );
}
