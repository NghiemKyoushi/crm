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
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import TableComponent from "@/components/TableComponent";
import {
  useBankAccountsPartnerScreen,
  useCreateNewMaterial,
  useDeleteMaterial,
  useListMaterial,
  useListMaterialSumary,
} from "../hooks/partner-manage-hook";
import { ColumnsType } from "antd/es/table";
import { FinanceSummary, PartnerTransaction } from "@/types/partner";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import PopupConfirm from "@/components/PopupConfirm";
const { Title, Text } = Typography;

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

  const [search, setSearch] = useState<string>(""); // add search state

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
      // form.resetFields(); // reset after adding
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
            queryKey: ["listwebsite"],
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
  const columns: ColumnsType<PartnerTransaction> = [
    {
      title: t('partnerManage.from'),
      dataIndex: "name",
      render: (_: string, record: PartnerTransaction) => (
        <div>
          <Text strong>{record.partner_name}</Text>
          <br />
          <Text type="secondary">{record.description}</Text>
        </div>
      ),
    },
    {
      title: t('partnerManage.note'),
      dataIndex: "note",
      width: 120,
    },
    {
      title: activeTab === "JPY" ? t('partnerManage.totalBuyJPY') : t('partnerManage.totalBuyUSD'),
      dataIndex: "amount",
      render: (val, record: PartnerTransaction) => {
        const color =
          record.amount > 0
            ? "text-green-600"
            : record.amount < 0
            ? "text-red-600"
            : "text-gray-600";
        return (
          <span className={`${color} flex flex-row items-center gap-1 `}>
            {record.amount > 0 && (
              <FontAwesomeIcon
                icon={record.amount > 0 ? faPlus : faMinus}
                className="!text-xs !w-2 !h-2 "
              />
            )}
            {val}
            {activeTab === "JPY" ? (
              <FontAwesomeIcon
                icon={faYenSign}
                className="!text-xs !w-3 !h-3"
              />
            ) : (
              <FontAwesomeIcon icon={faUsd} className="!text-xs !w-3 !h-3" />
            )}
          </span>
        );
      },
    },
    {
      title: t('partnerManage.exchangeRate'),
      dataIndex: "exchange_rate",
      render: (value: number) => `${value} ${t('partnerManage.currency')}`,
    },
    {
      title: t('partnerManage.createdDate'),
      dataIndex: "created_at",
      render: (value: string) => {
        if (!value) return "-";
        return dayjs(value).format("DD-MM-YYYY");
      },
    },
    {
      title: t('partnerManage.actions'),
      render: (_: any, record: PartnerTransaction) => (
        <div
          onClick={() => {
            setId(record.id.toString());
            setOpenConfirmDeleteMaterial(true);
          }}
        >
          <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
        </div>
      ),
    },
  ];
  const handleChangePage = (pageNumber: number) => {
    setPageMaterial(pageNumber - 1);
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

  return (
    <div className="p-6 space-y-6">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "JPY", label: t('partnerManage.manageJPY') },
          { key: "USD", label: t('partnerManage.manageUSD') },
        ]}
      />
      <div>
        <Title level={4}>
          {activeTab === "jpy"
            ? t('partnerManage.overviewJPY')
            : t('partnerManage.overviewUSD')}
        </Title>
        <div className="p-3 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="!h-32 !p-0 !bg-gradient-to-r !from-blue-500 !to-blue-600 !text-white shadow-md rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{t('partnerManage.totalPartners')}</p>
                <p className="text-2xl font-bold">
                  {summaryItem && summaryItem.partner_count}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faUsers}
                className="text-3xl opacity-90 w-4 h-4"
              />
            </div>
          </Card>

          <Card className="!h-32  !p-0 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white shadow-md rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">
                  {t('partnerManage.totalPurchase')} ({activeTab === "JPY" ? "JPY" : "USD"})
                </p>
                <p className="text-2xl font-bold">
                  {summaryItem && summaryItem.total_out}{" "}
                  {activeTab === "JPY" ? "¥" : "$"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={activeTab === "JPY" ? faYenSign : faDollarSign}
                className="text-3xl opacity-90 w-4 h-4"
              />
            </div>
          </Card>

          <Card className="!h-32  !p-0 !bg-gradient-to-r !from-purple-500 !to-fuchsia-600 !text-white shadow-md rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">
                  {t('partnerManage.totalRemaining')} ({activeTab === "JPY" ? "JPY" : "USD"})
                </p>
                <p className="text-2xl font-bold">
                  {summaryItem && summaryItem.total_in}{" "}
                  {activeTab === "JPY" ? "¥" : "$"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faWallet}
                className="text-3xl opacity-90 w-4 h-4"
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow w-full">
        <Title level={5} className="!mb-4 !text-gray-800">
          {t('partnerManage.addTransactionTitle')}
        </Title>

        <Form
          form={form}
          layout="vertical"
          className="grid  grid-cols-5 gap-4 !w-full"
        >
          <Form.Item
            name="partner"
            label={t('partnerManage.partner')}
            rules={[{ required: true, message: t('partnerManage.selectPartner') }]}
            className="mb-0"
          >
            <Select
              showSearch
              placeholder={t('partnerManage.selectPartnerPlaceholder')}
              className="!w-full !h-10"
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
            label={t('partnerManage.amount')}
            rules={[{ required: true, message: t('partnerManage.enterAmount') }]}
            className="mb-0 !w-full !h-10"
          >
            <InputNumber<string>
              className="!w-full [&_.ant-input-number-input]:!h-10 [&_.ant-input-number-input]:!py-0"
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
            label={t('partnerManage.exchangeRateLabel')}
            rules={[{ required: true }]}
            className="mb-0"
          >
            <InputNumber<string>
              className="!w-full [&_.ant-input-number-input]:!h-10 [&_.ant-input-number-input]:!py-0"
              step={0.01}
              stringMode
              formatter={(value) =>
                value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) => (value ? value.replace(/,/g, "") : "")}
              addonAfter={t('partnerManage.currencySymbol')}
            />
          </Form.Item>

          {/* Note */}
          <Form.Item name="note" label={t('partnerManage.noteLabel')} className="mb-0">
            <Input placeholder={t('partnerManage.notePlaceholder')} className="!w-full !h-10" />
          </Form.Item>

          {/* Button */}
          <Form.Item
            label=" "
            className="mb-0 col-span-1 md:col-span-1 !w-full"
          >
            <Button
              type="primary"
              onClick={() => handleAdd()}
              className="bg-blue-600 hover:!bg-blue-700 px-6 !h-10 !rounded-lg w-full"
            >
              {t('partnerManage.addButton')}
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* List */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="!mb-0">
            {t('partnerManage.partnerListTitle')}
          </Title>

          <div className="flex items-center gap-2">
            <Input
              placeholder={t('partnerManage.searchPartnerPlaceholder')}
              className="!w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={(e) =>
                setSearch((e.target as HTMLInputElement).value)
              }
              suffix={<FontAwesomeIcon icon={faSearch} className="w-4 h-4" />}
              allowClear
            />
          </div>
        </div>
        {!isLoadingMaterial && (
          <TableComponent
            columns={columns}
            dataSource={
              materialData?.data !== undefined ? materialData.data : []
            }
            rowHeight={45}
            pageSize={10}
            page={(materialData && materialData?.current_page + 1) || 0}
            onPageChange={handleChangePage}
            response={materialData}
            fontSize={14}
            headerHeight={44}
          />
        )}
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
