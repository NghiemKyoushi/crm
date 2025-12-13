import { Button, Input, Typography, Select, Spin } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import TableComponent from "@/components/TableComponent";
import CustomerDetailModal from "./modal-customer/modal-view-detail-customer";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  useListCustomer,
  useUpdateCateGoryForEachCus,
  useCreateCustomer,
} from "../../hooks/staff-manage";
import { CustomerModel } from "@/types/customer-type";
import CategorySelect, { CategoryOption } from "./customer-type-select";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePermission } from "@/components/layout/PermissionContext";
import { getListSaleStaff, CreateCustomerParams, getListCateCustomer } from "../../apis/staff-manage";
import AccountAssignButton from "@/features/user-website-accounts/components/account-assign-button";
import ModalCreateCustomer from "./modal-create-customer";

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

  // Sale phụ trách: Paging/Loadmore Setup
  const SALE_PAGE_SIZE = 10;
  const [salesData, setSalesData] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesPage, setSalesPage] = useState(0);
  const [salesHasMore, setSalesHasMore] = useState(true);

  // Fetch sales page
  const fetchSales = useCallback(
    async (pageToFetch = salesPage) => {
      setSalesLoading(true);
      try {
        const res = await getListSaleStaff({
          page: pageToFetch,
          page_size: SALE_PAGE_SIZE,
          search: undefined,
        });
        const dataArr =
          res?.data?.data ??
          res?.data ??
          res?.result?.data ??
          [];
        setSalesData((current) => {
          // Avoid duplicates
          const alreadyIds = new Set(current.map((x: any) => x.user_id));
          const newOpts = dataArr.filter((item: any) => !alreadyIds.has(item.user_id));
          return [...current, ...newOpts];
        });
        if (dataArr.length < SALE_PAGE_SIZE) setSalesHasMore(false);
        else setSalesHasMore(true);
      } catch (error) {
        setSalesHasMore(false);
      } finally {
        setSalesLoading(false);
      }
    },
    [salesPage]
  );

  // Reset Sale state on mount
  useEffect(() => {
    setSalesPage(0);
    setSalesData([]);
    setSalesHasMore(true);
  }, []);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchSales(0);
    // eslint-disable-next-line
  }, []);

  const handleSalePopupScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.offsetHeight + 30 >= target.scrollHeight &&
      !salesLoading &&
      salesHasMore
    ) {
      const nextPage = salesPage + 1;
      setSalesPage(nextPage);
      fetchSales(nextPage);
    }
  };
  const handleSaleDropdownVisibleChange = (open: boolean) => {
    if (open && salesData.length === 0) {
      setSalesPage(0);
      setSalesData([]);
      setSalesHasMore(true);
      fetchSales(0);
    }
  };

  const saleOptions = salesData.map((sale: any) => ({
    value: sale.user_id,
    label: sale.full_name,
  }));

  const updateCateMutation = useUpdateCateGoryForEachCus();
  const createCustomerMutation = useCreateCustomer();
  const { data, isFetching, isPending } = useListCustomer({
    page,
    page_size: 10,
    category_id: searchValues.category || undefined,
    search: searchValues.name || undefined,
    email: searchValues.email || undefined,
    phone_number: searchValues.phone || undefined,
    sale_id: searchValues.sale || undefined,
  });

  const [tableData, setTableData] = useState<CustomerModel[]>([]);

  useEffect(() => {
    if (data?.data) {
      setTableData(data.data);
    }
  }, [data]);

  const CATEGORY_PAGE_SIZE = 10;
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [categoryHasMore, setCategoryHasMore] = useState(true);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  const fetchCategoryData = useCallback(
    async (pageToFetch = categoryPage) => {
      setIsLoadingCategory(true);
      try {
        const res = await getListCateCustomer({
          page: pageToFetch,
          page_size: CATEGORY_PAGE_SIZE,
        });
        const dataArr =
          res?.data?.data ??
          res?.data ??
          res?.result?.data ??
          [];
        setCategoryOptions((current) => {
          // Avoid duplicates
          const alreadyIds = new Set(current.map((x: any) => x.value));
          const newOpts = dataArr
            .map((opt: any) => ({
              key: String(opt.id),
              value: opt.id,
              label: opt.group_name,
              color: opt.color,
              textColor: opt.text_color ?? "#000",
            }))
            .filter((it: any) => !alreadyIds.has(it.value));
          return [...current, ...newOpts];
        });
        if (dataArr.length < CATEGORY_PAGE_SIZE) setCategoryHasMore(false);
        else setCategoryHasMore(true);
      } catch (error) {
        setCategoryHasMore(false);
      } finally {
        setIsLoadingCategory(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryPage]
  );

  // Init first category page
  useEffect(() => {
    setCategoryPage(0);
    setCategoryOptions([]);
    setCategoryHasMore(true);
  }, []);

  useEffect(() => {
    fetchCategoryData(0);
    // eslint-disable-next-line
  }, []);

  const handleCategoryDropdownVisibleChange = (open: boolean) => {
    if (open && categoryOptions.length === 0) {
      setCategoryPage(0);
      setCategoryOptions([]);
      setCategoryHasMore(true);
      fetchCategoryData(0);
    }
  };

  // Trigger loadmore when scroll to bottom
  const handleCategoryPopupScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.offsetHeight + 30 >= target.scrollHeight &&
      !isLoadingCategory &&
      categoryHasMore
    ) {
      const nextPage = categoryPage + 1;
      setCategoryPage(nextPage);
      fetchCategoryData(nextPage);
    }
  };

  // ------------CATEGORY LOAD MORE LOGIC END-------------------

  const handleClosePopupdetail = () => {
    setSelectedId(null);
    setIsOpenDetail(false);
  };

  const handleUpdateColor = (e: number, userId: number, option?: CategoryOption) => {
    updateCateMutation.mutate(
      {
        category_id: e,
        id: userId,
      },
      {
        onSuccess: () => {
          toast.success(t("customerTable.updateSuccess"));
          const selectedCategory =
            option || categoryOptions.find((opt: any) => opt.value === e);
          setTableData((prev) =>
            prev.map((item) =>
              item.user_id === userId
                ? {
                    ...item,
                    category_id: e,
                    group_id: e,
                    group_name: selectedCategory?.label || item.group_name,
                    color: selectedCategory?.color || item.color,
                  }
                : item
            )
          );
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
            fallbackLabel={record.group_name}
            fallbackColor={record.color}
            onChange={(value, option) =>
              handleUpdateColor(value, record.user_id, option)
            }
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
    // {
    //   title: t("customerTable.debt"),
    //   dataIndex: "debt_amount",
    //   key: "debt_amount",
    //   width: 140,
    //   align: "right",
    //   render: (value: number) => (
    //     <div
    //       className={`text-sm ${value > 0 ? "text-red-600" : "text-gray-700"}`}
    //     >
    //       {value ? `${value.toLocaleString("vi-VN")}đ` : "0đ"}
    //     </div>
    //   ),
    // },
    {
      title: t("customerTable.actions"),
      key: "actions",
      width: 260,
      fixed: "right",
      render: (_: any, record: CustomerModel) => (
        <div className="flex gap-2 items-center">
          <AccountAssignButton
            userId={record.user_id}
            countData={record.count_data}
          />
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-800">
          {t("customerManage.title")}
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsOpenCreateModal(true)}
          className="bg-blue-500"
        >
          Tạo tài khoản
        </Button>
      </div>
      <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
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
            loading={isLoadingCategory}
            className="!h-10"
            options={
              categoryOptions?.map((cat: any) => ({
                value: cat.value,
                label: cat.label,
              })) || []
            }
            dropdownRender={menu => (
              <>
                {menu}
                {isLoadingCategory && (
                  <div style={{ textAlign: "center", padding: 10 }}>
                    <Spin size="small" />
                  </div>
                )}
              </>
            )}
            onPopupScroll={handleCategoryPopupScroll}
            onDropdownVisibleChange={handleCategoryDropdownVisibleChange}
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
            dropdownRender={menu => (
              <>
                {menu}
                {salesLoading && (
                  <div style={{ textAlign: "center", padding: 10 }}>
                    <Spin size="small" />
                  </div>
                )}
              </>
            )}
            onPopupScroll={handleSalePopupScroll}
            onDropdownVisibleChange={handleSaleDropdownVisibleChange}
          />
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<SearchOutlined />}
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
          dataSource={tableData}
          rowHeight={55}
          pageSize={10}
          page={(data?.current_page ?? page) + 1}
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