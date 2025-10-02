"use client";

import React, { useState } from "react";
import {
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Spin,
  InputNumber,
  Empty,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faMinus,
  faPlus,
  faSearch,
  faTrash,
  faUsd,
  faUsers,
  faWallet,
  faYenSign,
  faExchangeAlt,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  useBankAccountsPartnerScreen,
  useCreateNewMaterial,
  useDeleteMaterial,
  useListMaterial,
  useListMaterialSumary,
} from "../hooks/partner-manage-hook";
import { FinanceSummary, PartnerTransaction } from "@/types/partner";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import PopupConfirm from "@/components/PopupConfirm";
const { Text } = Typography;

export default function JPYManagementPage() {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("JPY");
  const [page, setPage] = useState(0);
  const [pageMaterial, setPageMaterial] = useState(0);

  const queryClient = useQueryClient();
  const [openConfirmDeleteMaterial, setOpenConfirmDeleteMaterial] =
    useState(false);
  const [id, setId] = useState("");

  const [search, setSearch] = useState<string>("");

  const { data, isLoading, isFetching } = useBankAccountsPartnerScreen({
    page,
    size: 20,
    type: 2,
  });
  const { data: materialData, isLoading: isLoadingMaterial } = useListMaterial({
    page: pageMaterial,
    page_size: 10,
    search: search || undefined,
    currency_code: activeTab,
  });

  const { data: listSummary, isLoading: isLoadingSummary } =
    useListMaterialSumary();
  const deleteMaterialMutation = useDeleteMaterial();

  const [options, setOptions] = useState<any[]>([]);

  const createNewMaterialMutation = useCreateNewMaterial();

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      createNewMaterialMutation.mutate(
        {
          partner_id: values.partner,
          amount: values.amount,
          currency_code: activeTab,
          exchange_rate: values.rate,
          note: values.note,
          amount_type: "IN",
        },
        {
          onSuccess: () => {
            toast.success(t('partnerManage.createMaterialSuccess'));
            queryClient.invalidateQueries({
              queryKey: ["listMaterial"],
            });
            form.resetFields();
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  const handleDelete = () => {
    deleteMaterialMutation.mutate(
      {
        id: +id,
      },
      {
        onSuccess: () => {
          toast.success(t('partnerManage.deleteMaterialSuccess'));
          queryClient.invalidateQueries({
            queryKey: ["listMaterial"],
          });
          setOpenConfirmDeleteMaterial(false);
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
    setId("null");
  };

  const handleChangePage = (direction: 'prev' | 'next') => {
    if (direction === 'next' && materialData && pageMaterial < materialData.total_pages - 1) {
      setPageMaterial(pageMaterial + 1);
    } else if (direction === 'prev' && pageMaterial > 0) {
      setPageMaterial(pageMaterial - 1);
    }
  };

  React.useEffect(() => {
    if (data && data.content) {
      setOptions((prev) => {
        const newData = data.content.filter(
          (item) => !prev.some((o) => o.value === item.id)
        );
        return [
          ...prev,
          ...newData.map((item) => ({
            label: item.account_holder,
            value: item.id,
          })),
        ];
      });
    }
  }, [data]);

  const summaryItem: FinanceSummary = listSummary?.find(
    (item: FinanceSummary) => item.currency_code === activeTab
  );

  const renderTransactionCard = (record: PartnerTransaction) => {
    const isUSRoute = activeTab === "USD";
    const color =
      record.amount > 0
        ? "text-green-600"
        : record.amount < 0
        ? "text-red-600"
        : "text-gray-600";

    return (
      <div
        key={record.id}
        className="bg-white border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-md transition-all duration-200 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-10 -mt-10 opacity-40"></div>

        <div className="relative grid grid-cols-12 gap-3 items-center">
          {/* Partner Info */}
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {record.partner_name?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">
                  {record.partner_name}
                </p>
                <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{record.description}</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="col-span-2">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-0.5">Số tiền</p>
              <div className={`flex items-center justify-center gap-1 ${color} font-bold text-sm`}>
                {record.amount > 0 && (
                  <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                )}
                {Math.abs(record.amount).toLocaleString()}
                <FontAwesomeIcon
                  icon={isUSRoute ? faUsd : faYenSign}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="col-span-2">
            <div className="text-center bg-gray-50 rounded-md p-1.5">
              <p className="text-[10px] text-gray-500 mb-0.5">
                <FontAwesomeIcon icon={faExchangeAlt} className="mr-0.5" />
                Tỷ giá
              </p>
              <p className="text-xs font-medium text-gray-800">
                {record.exchange_rate?.toLocaleString()} VND
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="col-span-3">
            <div className="bg-blue-50 rounded-md p-1.5">
              <p className="text-[10px] text-blue-600 mb-0.5">Ghi chú</p>
              <p className="text-xs text-gray-700 truncate">
                {record.note || "-"}
              </p>
            </div>
          </div>

          {/* Date & Actions */}
          <div className="col-span-2 flex items-center justify-between gap-2">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-0.5">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-0.5" />
              </p>
              <p className="text-[10px] text-gray-600">
                {record.created_at ? dayjs(record.created_at).format("DD/MM/YY") : "-"}
              </p>
            </div>
            <Button
              danger
              type="primary"
              shape="circle"
              size="small"
              icon={<FontAwesomeIcon icon={faTrash} className="text-xs" />}
              onClick={() => {
                setId(record.id.toString());
                setOpenConfirmDeleteMaterial(true);
              }}
              className="shadow-sm hover:shadow-md"
            />
          </div>
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: "JPY",
      label: (
        <span className="flex items-center gap-2 text-base">
          <FontAwesomeIcon icon={faYenSign} className="text-red-600" />
          {t('partnerManage.manageJPY')}
        </span>
      ),
    },
    {
      key: "USD",
      label: (
        <span className="flex items-center gap-2 text-base">
          <FontAwesomeIcon icon={faDollarSign} className="text-green-600" />
          {t('partnerManage.manageUSD')}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {activeTab === "JPY" ? t('partnerManage.overviewJPY') : t('partnerManage.overviewUSD')}
              </h1>
              <p className="text-xs text-gray-500">Quản lý giao dịch với đối tác</p>
            </div>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="middle"
              className="partner-tabs"
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="!border-0 !shadow-md !rounded-xl !bg-gradient-to-br !from-blue-500 !to-blue-600 !text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90 mb-1">{t('partnerManage.totalPartners')}</p>
                  <p className="text-2xl font-bold">
                    {summaryItem ? summaryItem.partner_count : 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-xl" />
                </div>
              </div>
            </Card>

            <Card className="!border-0 !shadow-md !rounded-xl !bg-gradient-to-br !from-green-500 !to-emerald-600 !text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90 mb-1">
                    {t('partnerManage.totalPurchase')}
                  </p>
                  <p className="text-2xl font-bold">
                    {summaryItem ? Math.abs(summaryItem.total_out).toLocaleString() : 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={activeTab === "JPY" ? faYenSign : faDollarSign}
                    className="text-xl"
                  />
                </div>
              </div>
            </Card>

            <Card className="!border-0 !shadow-md !rounded-xl !bg-gradient-to-br !from-purple-500 !to-fuchsia-600 !text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90 mb-1">
                    {t('partnerManage.totalRemaining')}
                  </p>
                  <p className="text-2xl font-bold">
                    {summaryItem ? summaryItem.total_in.toLocaleString() : 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faWallet} className="text-xl" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faPlus} className="text-blue-600 text-sm" />
            </div>
            {t('partnerManage.addTransactionTitle')}
          </h2>

          <Form form={form} layout="vertical">
            <div className="grid grid-cols-5 gap-3">
              <Form.Item
                name="partner"
                label={<span className="text-xs font-medium text-gray-700">{t('partnerManage.partner')}</span>}
                rules={[{ required: true, message: t('partnerManage.selectPartner') }]}
                className="mb-0"
              >
                <Select
                  showSearch
                  placeholder={t('partnerManage.selectPartnerPlaceholder')}
                  size="middle"
                  className="!w-full"
                  options={options}
                  loading={isLoading}
                  notFoundContent={isLoading ? <Spin size="small" /> : null}
                  onPopupScroll={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.scrollTop + target.offsetHeight >=
                      target.scrollHeight - 10
                    ) {
                      if (!isFetching) {
                        setPage((p) => p + 1);
                      }
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name="amount"
                label={<span className="text-xs font-medium text-gray-700">{t('partnerManage.amount')}</span>}
                rules={[{ required: true, message: t('partnerManage.enterAmount') }]}
                className="mb-0"
              >
                <InputNumber<string>
                  size="middle"
                  className="!w-full"
                  step={0.01}
                  stringMode
                  formatter={(value) =>
                    value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                  }
                  parser={(value) => (value ? value.replace(/,/g, "") : "")}
                  addonAfter={activeTab === "JPY" ? "¥" : "$"}
                />
              </Form.Item>

              <Form.Item
                name="rate"
                label={<span className="text-xs font-medium text-gray-700">{t('partnerManage.exchangeRateLabel')}</span>}
                rules={[{ required: true }]}
                className="mb-0"
              >
                <InputNumber<string>
                  size="middle"
                  className="!w-full"
                  step={0.01}
                  stringMode
                  formatter={(value) =>
                    value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                  }
                  parser={(value) => (value ? value.replace(/,/g, "") : "")}
                  addonAfter="VND"
                />
              </Form.Item>

              <Form.Item
                name="note"
                label={<span className="text-xs font-medium text-gray-700">{t('partnerManage.noteLabel')}</span>}
                className="mb-0"
              >
                <Input size="middle" placeholder={t('partnerManage.notePlaceholder')} className="!w-full" />
              </Form.Item>

              <Form.Item label=" " className="mb-0">
                <Button
                  type="primary"
                  size="middle"
                  onClick={handleAdd}
                  className="!bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !border-0 !shadow-md w-full !h-full"
                  icon={<FontAwesomeIcon icon={faPlus} className="mr-1 text-xs" />}
                >
                  {t('partnerManage.addButton')}
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faWallet} className="text-purple-600 text-sm" />
              </div>
              {t('partnerManage.partnerListTitle')}
              {materialData && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                  {materialData.total_items}
                </span>
              )}
            </h2>
            <Input
              placeholder={t('partnerManage.searchPartnerPlaceholder')}
              size="middle"
              className="!w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
              allowClear
            />
          </div>

          {isLoadingMaterial ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : materialData?.data && materialData.data.length > 0 ? (
            <>
              <div className="space-y-2">
                {materialData.data.map((record) => renderTransactionCard(record))}
              </div>

              {/* Pagination */}
              {materialData.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button
                    size="middle"
                    disabled={pageMaterial === 0}
                    onClick={() => handleChangePage('prev')}
                    className="!rounded-lg"
                  >
                    Trang trước
                  </Button>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                    {pageMaterial + 1} / {materialData.total_pages}
                  </div>
                  <Button
                    size="middle"
                    disabled={pageMaterial >= materialData.total_pages - 1}
                    onClick={() => handleChangePage('next')}
                    className="!rounded-lg"
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có giao dịch nào"
              className="py-8"
            />
          )}
        </div>
      </div>

      <PopupConfirm
        open={openConfirmDeleteMaterial}
        type={"delete"}
        title={t('partnerManage.deleteMaterialTitle')}
        content={t('partnerManage.deleteMaterialContent')}
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirmDeleteMaterial(false)}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
}
