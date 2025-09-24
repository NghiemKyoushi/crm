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
  faSearch,
  faTrash,
  faUsers,
  faWallet,
  faYenSign,
} from "@fortawesome/free-solid-svg-icons";
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
import { useTranslation } from "react-i18next";
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

  const [search, setSearch] = useState<string>(""); // 👈 thêm search state

  const { data, isLoading, isFetching } = useBankAccountsPartnerScreen({
    page,
    size: 20,
    type: 2,
  });
  const { data: materialData, isLoading: isLoadingMaterial } = useListMaterial({
    page: pageMaterial,
    page_size: 10,
    search: search || undefined,
    currencyCode: activeTab,
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
            toast.success("Tạo nguyên liệu mới thành công!");
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
      // form.resetFields(); // reset sau khi thêm
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
          toast.success("Xóa Website thành công!");
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
      title: "Từ",
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
      title: activeTab === "JPY" ? "Tổng Mua (JPY)" : "Tổng Mua (USD)",
      dataIndex: "amount",
    },
    {
      title: "Tỷ giá",
      dataIndex: "exchange_rate",
      render: (value: number) => `${value} VNĐ`,
    },
    {
      title: "Ngày Tạo",
      dataIndex: "created_at",
      render: (value: string) => {
        if (!value) return "-";
        return dayjs(value).format("DD-MM-YYYY");
      },
    },
    {
      title: "Hành động",
      render: (_: any, record: PartnerTransaction) => (
        <div
          onClick={() => {
            // setId(record.);
            setOpenConfirmDeleteMaterial(true);
          }}
        >
          <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
          {/* <DeleteOutlined className="text-red-500 cursor-pointer" /> */}
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
  console.log(materialData);

  return (
    <div className="p-6 space-y-6">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "JPY", label: "Quản lý (JPY)" },
          { key: "USD", label: "Quản lý (USD)" },
        ]}
      />
      <div>
        <Title level={4}>
          {activeTab === "jpy"
            ? "Tổng quan Quản lý JPY"
            : "Tổng quan Quản lý USD"}
        </Title>
        <div className="p-3 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="!h-32 !p-0 !bg-gradient-to-r !from-blue-500 !to-blue-600 !text-white shadow-md rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Tổng Đối tác</p>
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
                  Tổng Mua ({activeTab === "jpy" ? "JPY" : "USD"})
                </p>
                <p className="text-2xl font-bold">
                  {summaryItem && summaryItem.total_out}{" "}
                  {activeTab === "JPY" ? "¥" : "$"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faYenSign}
                className="text-3xl opacity-90 w-4 h-4"
              />
            </div>
          </Card>

          <Card className="!h-32  !p-0 !bg-gradient-to-r !from-purple-500 !to-fuchsia-600 !text-white shadow-md rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">
                  Tổng còn lại ({activeTab === "jpy" ? "JPY" : "USD"})
                </p>
                <p className="text-2xl font-bold">
                  {summaryItem && summaryItem.total_in}{" "}
                  {activeTab === "jpy" ? "¥" : "$"}
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
          Thêm Giao dịch Mua Nguyên liệu
        </Title>

        <Form
          form={form}
          layout="vertical"
          className="grid  grid-cols-5 gap-4 !w-full"
        >
          <Form.Item
            name="partner"
            label="Đối tác"
            rules={[{ required: true, message: "Chọn đối tác" }]}
            className="mb-0"
          >
            <Select
              showSearch
              placeholder="-- Chọn đối tác --"
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
            label="Số tiền Yên"
            rules={[{ required: true, message: "Nhập số tiền" }]}
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
            label="Tỷ giá"
            // initialValue={180}
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
              addonAfter="đ"
            />
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item name="note" label="Ghi chú" className="mb-0">
            <Input placeholder="Ghi chú..." className="!w-full !h-10" />
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
              + Thêm
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Danh sách */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="!mb-0">
            Danh sách Đối tác và Công nợ
          </Title>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm đối tác..."
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
        title={"Xoá nguyên liệu"}
        content={"Bạn có chắc muốn xoá nguyên liệu không ?"}
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirmDeleteMaterial(false)}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
}
