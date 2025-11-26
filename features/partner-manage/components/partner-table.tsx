"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Modal,
  message,
  Row,
  Col,
  Radio,
  Spin,
  DatePicker,
  Statistic,
  Progress,
  Tabs,
  Space,
} from "antd";
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, CalendarOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  useCreateNewMaterial,
  useFifoBalance,
  useProfitLossSummary,
} from "../hooks/partner-manage-hook";
import { OrderProfitLossTable } from "./order-profit-loss-table";
import { TransactionList } from "./transaction-list";
import { getListPartner } from "@/features/finance-manage/apis";
import "./fifo-styles.css";
import { Partner } from "@/features/finance-manage/components/tabs/bank-partner/modal/add-account-bank";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Option } = Select;

type TransactionType = "incoming" | "outgoing";

export default function FIFOMaterialManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // State
  const [selectedCurrency, setSelectedCurrency] = useState<string>("JPY");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("incoming");
  const [page, setPage] = useState<number>(0);

  // Date range filter
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // Date default state for modal
  const [defaultDate, setDefaultDate] = useState<dayjs.Dayjs | null>(null);

  // Whenever modal opens, set default date
  useEffect(() => {
    if (modalVisible) {
      const now = dayjs();
      setDefaultDate(now);
      form.setFieldsValue({ date: now });
    }
    // When modal closes, clear the defaultDate (optional, if you want to always use fresh "now" on open)
    if (!modalVisible) {
      setDefaultDate(null);
    }
  }, [modalVisible, form]);

  // Partner data using API call
  const {
    data: partnerData,
    isLoading: isPartnerLoading,
    isError: isPartnerError,
  } = useQuery({
    queryKey: ["partner-list", page],
    queryFn: () => getListPartner({ page, page_size: 10 }),
  });

  // Queries
  const { data: fifoBalanceData } = useFifoBalance();
  const { data: profitLossData } = useProfitLossSummary(selectedCurrency);
  const createMutation = useCreateNewMaterial();

  // Get balance for current selected currency
  const currentBalance = fifoBalanceData?.data?.find(
    (b) => b.currencyCode === selectedCurrency
  );

  // Get profit/loss summary for current currency
  const currentProfitLoss = profitLossData?.data?.find(
    (p) => p.currencyCode === selectedCurrency
  );

  // Format helper functions
  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(num));
  };

  const calculateProgress = (balance: any): number => {
    if (!balance || balance.totalIncoming === 0) return 0;
    return Math.round((balance.fifoBalance / balance.totalIncoming) * 100);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        partnerId: values.partnerId,
        amount:
          transactionType === "incoming"
            ? values.amount
            : -Math.abs(values.amount),
        currencyCode: selectedCurrency,
        exchangeRate: values.exchangeRate,
        note: values.note || undefined,
        date: values.date ? dayjs(values.date).format("YYYY-MM-DD HH:mm:ss") : undefined,
      };

      await createMutation.mutateAsync(payload);
      toast.success(t("partnerManage.createMaterialSuccess"));

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["listMaterial"] });
      queryClient.invalidateQueries({ queryKey: ["fifoBalance"] });
      queryClient.invalidateQueries({ queryKey: ["listMaterialSumary"] });
      queryClient.invalidateQueries({ queryKey: ["profitLossSummary"] });

      form.resetFields();
      setModalVisible(false);
    } catch (error: any) {
      if (error.errorFields) {
        // Validation errors
        return;
      }
      toast.error(error.response?.data?.message || t("common.error"));
    }
  };

  // Check if there's enough balance for outgoing transaction
  const handleTransactionTypeChange = (value: TransactionType) => {
    setTransactionType(value);
    if (value === "outgoing" && currentBalance) {
      Modal.info({
        title: t("partnerManage.fifoBalance"),
        content: (
          <div>
            <p>
              {t("partnerManage.fifoBalance")}:{" "}
              {currentBalance.fifoBalance.toLocaleString()} {selectedCurrency}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t("partnerManage.note")}: {t("partnerManage.amountNegative")}
            </p>
          </div>
        ),
      });
    }
  };

  // Partner select options
  const partnerOptions =
    (!isPartnerLoading && !isPartnerError && Array.isArray(partnerData?.data)
      ? partnerData.data.map((partner: Partner) => ({
          label: `${partner.email}`,
          value: partner.id,
        }))
      : []) || [];

  // Available currencies
  const currencyTabs = [
    { key: "JPY", label: "JPY" },
    { key: "KG-JP", label: "KG-JP" },
    { key: "PT-JP", label: "PT-JP" },
    { key: "USD", label: "USD" },
    { key: "KG-US", label: "KG-US" },
    { key: "PT-US", label: "PT-US" },
  ];

  return (
    <div className="p-6">
      {/* Page Header - Compact */}
      <div className="mb-3">
        <h2 className="text-base font-bold text-gray-800">
          {t("menu.partnerManagement")}
        </h2>
      </div>

      {/* Main Container Card */}
      <Card>
        {/* Currency Tabs */}
        <style jsx global>{`
          .partner-currency-tabs .ant-tabs-nav {
            margin-bottom: 20px;
          }
          .partner-currency-tabs .ant-tabs-tab {
            font-size: 14px;
          }
        `}</style>

        <Tabs
          activeKey={selectedCurrency}
          onChange={setSelectedCurrency}
          type="line"
          className="partner-currency-tabs"
        >
          {currencyTabs.map((tab) => (
            <TabPane tab={tab.label} key={tab.key}>
              {/* Metrics Header */}
              <Row gutter={[12, 12]} className="mb-4">
                {/* Tồn kho */}
                <Col xs={8} sm={6} md={5}>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Tồn kho</div>
                    <div className="text-base font-semibold text-gray-800">
                      {currentBalance ? formatNumber(currentBalance.fifoBalance, 0) : "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {calculateProgress(currentBalance)}%
                    </div>
                  </div>
                </Col>

                {/* Nhập */}
                <Col xs={8} sm={6} md={5}>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Nhập</div>
                    <div className="text-base font-semibold text-green-600">
                      +{currentBalance ? formatNumber(currentBalance.totalIncoming, 0) : "0"}
                    </div>
                  </div>
                </Col>

                {/* Xuất */}
                <Col xs={8} sm={6} md={4}>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Xuất</div>
                    <div className="text-base font-semibold text-red-600">
                      -{currentBalance ? formatNumber(currentBalance.totalOutgoing, 0) : "0"}
                    </div>
                  </div>
                </Col>

                {/* GD */}
                <Col xs={8} sm={6} md={3}>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">GD</div>
                    <div className="text-base font-semibold text-gray-800">
                      {currentBalance ? currentBalance.transactionCount : 0}
                    </div>
                  </div>
                </Col>

                {/* Tổng Lãi/Lỗ */}
                <Col xs={16} sm={12} md={7}>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Tổng Lãi/Lỗ</div>
                    <div
                      className="text-base font-semibold"
                      style={{
                        color: currentProfitLoss && currentProfitLoss.totalProfitLossVnd > 0 ? "#52c41a" : "#ff4d4f",
                      }}
                    >
                      {currentProfitLoss
                        ? `${currentProfitLoss.totalProfitLossVnd > 0 ? "+" : ""}${formatCurrency(currentProfitLoss.totalProfitLossVnd)}đ`
                        : "0đ"}
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="border-t border-gray-200 mb-4"></div>

              {/* Transaction List */}
              <TransactionList
                currencyCode={selectedCurrency}
                onAddTransaction={() => setModalVisible(true)}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />

              {/* Order Profit/Loss Table */}
              <OrderProfitLossTable
                code={selectedCurrency}
                dateRange={dateRange}
              />
            </TabPane>
          ))}
        </Tabs>
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        title={t("partnerManage.addTransactionTitle")}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={t("partnerManage.saveButton")}
        cancelText={t("partnerManage.cancelButton")}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          {/* Transaction Type */}
          <Form.Item label={t("partnerManage.transactionType")} required>
            <Radio.Group
              value={transactionType}
              onChange={(e) => handleTransactionTypeChange(e.target.value)}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="incoming">
                {t("partnerManage.addIncomingTransaction")}
              </Radio.Button>
              <Radio.Button value="outgoing">
                {t("partnerManage.addOutgoingTransaction")}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Currency (read-only, based on current selection) */}
          <Form.Item
            label={
              selectedCurrency.includes("KG")
                ? t("partnerManage.unit")
                : t("partnerManage.currencyCode")
            }
          >
            <Input value={selectedCurrency} disabled size="large" />
          </Form.Item>

          {/* Partner Selection */}
          <Form.Item
            label={t("partnerManage.partner")}
            name="partnerId"
            rules={[
              {
                required: true,
                message: t("partnerManage.selectPartner"),
              },
            ]}
          >
            <Select
              showSearch
              placeholder={t("partnerManage.selectPartnerPlaceholder")}
              size="large"
              optionFilterProp="children"
              loading={isPartnerLoading}
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === "string") {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
              options={partnerOptions}
              notFoundContent={isPartnerLoading ? <Spin size="small" /> : null}
            />
          </Form.Item>

          {/* Date Field */}
          <Form.Item
            label={t("partnerManage.inputDate")}
            name="date"
            rules={[
              {
                required: true,
                message: t("partnerManage.selectInputDate"),
              },
            ]}
            initialValue={defaultDate}
          >
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={t("partnerManage.inputDatePlaceholder")}
              showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
              value={form.getFieldValue('date')}
              // onChange is not necessary unless you want extra sync with form
            />
          </Form.Item>

          {/* Amount */}
          <Form.Item
            label={selectedCurrency.includes("PT") ? t("partnerManage.amountMoney") : t("partnerManage.amount")}
            name="amount"
            rules={[
              {
                required: true,
                message: t("partnerManage.enterAmount"),
              },
              {
                type: "number",
                min: 0.01,
                message: t("partnerManage.amountPositive"),
              },
              ...(transactionType === "outgoing" && currentBalance && !selectedCurrency.includes("PT")
                ? [
                    {
                      validator: (_: any, value: number) => {
                        if (value > currentBalance.fifoBalance) {
                          return Promise.reject(
                            new Error(
                              `${t(
                                "partnerManage.fifoBalance"
                              )}: ${currentBalance.fifoBalance.toLocaleString()} ${selectedCurrency}`
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]
                : []),
            ]}
            extra={
              transactionType === "outgoing" && currentBalance && !selectedCurrency.includes("PT") ? (
                <span className="text-sm text-gray-500">
                  {t("partnerManage.fifoBalance")}:{" "}
                  {currentBalance.fifoBalance.toLocaleString()} {selectedCurrency}
                </span>
              ) : null
            }
          >
            <InputNumber
              placeholder={
                selectedCurrency.includes("PT")
                  ? t("partnerManage.amountMoney")
                  : t("partnerManage.enterAmount")
              }
              style={{ width: "100%" }}
              size="large"
              min={0}
              precision={2}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/,/g, "") as any}
            />
          </Form.Item>

          {/* Exchange Rate */}
          {!selectedCurrency.includes("PT") && (
            <Form.Item
              label={
                selectedCurrency.includes("KG")
                  ? t("partnerManage.feePerKg")
                  : t("partnerManage.exchangeRateLabel")
              }
              name="exchangeRate"
              rules={[
                {
                  required: true,
                  message: t("partnerManage.exchangeRateLabel"),
                },
                {
                  type: "number",
                  min: 0.01,
                  message: t("partnerManage.exchangeRatePositive"),
                },
              ]}
            >
              <InputNumber
                placeholder={t("partnerManage.exchangeRateLabel")}
                style={{ width: "100%" }}
                size="large"
                min={0}
                precision={2}
                addonAfter="VND"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/,/g, "") as any}
              />
            </Form.Item>
          )}

          {/* Note */}
          <Form.Item label={t("partnerManage.noteLabel")} name="note">
            <Input.TextArea
              placeholder={t("partnerManage.notePlaceholder")}
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
