"use client";

import React, { useState, useEffect } from "react";
import {
  Tabs,
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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  useCreateNewMaterial,
  useFifoBalance,
} from "../hooks/partner-manage-hook";
import { FifoBalanceCards } from "./fifo-balance-cards";
import { ProfitLossSummaryComponent } from "./profit-loss-summary";
import { ProfitLossChart } from "./profit-loss-chart";
import { OrderProfitLossTable } from "./order-profit-loss-table";
import { TransactionList } from "./transaction-list";
import { getListPartner } from "@/features/finance-manage/apis";
import "./fifo-styles.css";
import { Partner } from "@/features/finance-manage/components/tabs/bank-partner/modal/add-account-bank";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Option } = Select;

type TransactionType = "incoming" | "outgoing";

type CurrencyTab = "JPY" | "USD"; // Only "JPY" or "USD" for the main tab
type SubTab = "JPY" | "KG-JP" | "PT-JP" | "USD" | "KG-USD" | "PT-USD"; // Detailed sub-tabs based on main tab

// Section tabs within subTab panel (the "bộ ba" as per instruction)
type SectionTabKey = "transactions" | "profitloss" | "reports";

export default function FIFOMaterialManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // State
  // mainTabKey = "JPY" or "USD"
  const [mainTabKey, setMainTabKey] = useState<CurrencyTab>("JPY");
  // subTabKey = "JPY", "KG-JP", "PT-JP", "USD", "KG-USD", "PT-USD"
  const [subTabKey, setSubTabKey] = useState<SubTab>("JPY");

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("incoming");
  const [page, setPage] = useState<number>(0);

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

  const defaultSectionTab: SectionTabKey = "transactions";
  const [sectionTabs, setSectionTabs] = useState<Record<SubTab, SectionTabKey>>({
    "JPY": defaultSectionTab,
    "KG-JP": defaultSectionTab,
    "PT-JP": defaultSectionTab,
    "USD": defaultSectionTab,
    "KG-USD": defaultSectionTab,
    "PT-USD": defaultSectionTab,
  });

  // Section tab list for each subTab (always show 3)
  const sectionTabList = [
    { key: "transactions" as SectionTabKey, label: t("partnerManage.transactionsTab") },
    { key: "profitloss" as SectionTabKey, label: t("partnerManage.profitLossTab") },
    { key: "reports" as SectionTabKey, label: t("partnerManage.reportsTab") },
  ];

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
  const createMutation = useCreateNewMaterial();
  let currencyCode: string = "JPY";
  if (subTabKey === "JPY" && mainTabKey === "JPY") currencyCode = "JPY";
  else if (subTabKey === "KG-JP" && mainTabKey === "JPY") currencyCode = "KG-JP";
  else if (subTabKey === "PT-JP" && mainTabKey === "JPY") currencyCode = "PT-JP";
  else if (subTabKey === "USD" && mainTabKey === "USD") currencyCode = "USD";
  else if (subTabKey === "KG-USD" && mainTabKey === "USD") currencyCode = "KG-US";
  else if (subTabKey === "PT-USD" && mainTabKey === "USD") currencyCode = "PT-US";

  // Get balance for current selected currency
  const currentBalance = fifoBalanceData?.data?.find(
    (b) => b.currencyCode === currencyCode
  );

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Use the currently mapped currencyCode:
      const payload = {
        partnerId: values.partnerId,
        amount:
          transactionType === "incoming"
            ? values.amount
            : -Math.abs(values.amount),
        currencyCode: currencyCode,
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
              {currentBalance.fifoBalance.toLocaleString()} {currencyCode}
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

  // Build sub tab list for each main tab
  const getSubTabs = (main: CurrencyTab) => {
    if (main === "JPY") {
      return [
        { key: "JPY", label: t("partnerManage.manageJPY") },
        { key: "KG-JP", label: t("partnerManage.manageKG") },
        { key: "PT-JP", label: t("partnerManage.manageSucharge") },
      ];
    }
    if (main === "USD") {
      return [
        { key: "USD", label: t("partnerManage.manageUSD") },
        { key: "KG-USD", label: t("partnerManage.manageKG") },
        { key: "PT-USD", label: t("partnerManage.manageSucharge") },
      ];
    }
    return [];
  };

  // Render content for each section tab (transactions, profitloss, reports)
  const renderSectionTabContent = (sectionKey: SectionTabKey, sectionTabKey: any) => {
    console.log('sectionTabKey', sectionTabKey);
    
    switch (sectionKey) {
      case "transactions":
        return (
          <div className="fifo-content-area">
            <TransactionList
              currencyCode={currencyCode}
              onAddTransaction={() => setModalVisible(true)}
            />
          </div>
        );
      case "profitloss":
        return (
          <div className="fifo-content-area">
            <ProfitLossSummaryComponent code = {sectionTabKey} />
            <OrderProfitLossTable code = {sectionTabKey}/>
          </div>
        );
      case "reports":
        return (
          <div className="fifo-content-area">
            <ProfitLossChart code={sectionTabKey} />
          </div>
        );
      default:
        return null;
    }
  };

  // Render each sub tab with its internal "bộ ba" section tabs
  const renderSubTabPanelWithSectionTabs = (subTab: SubTab) => {    
    const sectionTabKey = sectionTabs[subTab];
    return (
      <Tabs
        activeKey={sectionTabKey}
        onChange={(sectionKey) => {          
          setSectionTabs((prev) => ({
            ...prev,
            [subTab]: sectionKey as SectionTabKey,
          }));
        }}
        className="fifo-section-tabs"
        tabBarGutter={32}
      >
        {sectionTabList.map((section) => (
          <TabPane tab={section.label} key={section.key}>
            {renderSectionTabContent(section.key, subTab)}
          </TabPane>
        ))}
      </Tabs>
    );
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          {t("menu.partnerManagement")}
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          {t("partnerManage.fifoBalanceTitle")}
        </p>
      </div>

      {/* FIFO Balance Cards - Always visible at top */}

      {/* Currency Tabs and Section Tab Styling */}
      <style jsx global>{`
        .fifo-main-tabs .ant-tabs-nav {
          width: 100%;
        }
        .fifo-main-tabs .ant-tabs-nav-list {
          width: 100%;
          display: flex;
        }
        .fifo-main-tabs .ant-tabs-tab {
          flex: 1;
          justify-content: center;
          margin: 0 !important;
        }
        .fifo-main-tabs .ant-tabs-content-holder {
          width: 100%;
          padding: 0 !important;
        }
        .fifo-main-tabs .ant-tabs-content {
          width: 100%;
        }
        .fifo-main-tabs .ant-tabs-tabpane {
          width: 100%;
          padding: 0 !important;
        }
        .fifo-sub-tabs {
          width: 100%;
        }
        .fifo-sub-tabs .ant-tabs-nav {
          width: 100%;
        }
        .fifo-sub-tabs .ant-tabs-nav-list {
          width: 100%;
          display: flex;
        }
        .fifo-sub-tabs .ant-tabs-tab {
          flex: 1;
          justify-content: center;
        }
        .fifo-sub-tabs .ant-tabs-content-holder {
          width: 100%;
          padding: 24px 0 !important;
        }
        .fifo-sub-tabs .ant-tabs-content {
          width: 100%;
        }
        .fifo-sub-tabs .ant-tabs-tabpane {
          width: 100%;
          padding: 0 !important;
        }
        .fifo-section-tabs {
          width: 100%;
        }
        .fifo-section-tabs .ant-tabs-nav {
          width: 100%;
        }
        .fifo-section-tabs .ant-tabs-nav-list {
          width: 100%;
          display: flex;
        }
        .fifo-section-tabs .ant-tabs-tab {
          flex: 1;
          justify-content: center;
        }
        .fifo-section-tabs .ant-tabs-content-holder {
          width: 100%;
          padding: 0 !important;
        }
        .fifo-section-tabs .ant-tabs-content {
          width: 100%;
        }
        .fifo-section-tabs .ant-tabs-tabpane {
          width: 100%;
          padding: 0 !important;
        }
        .fifo-main-tabs .ant-card,
        .fifo-sub-tabs .ant-card,
        .fifo-section-tabs .ant-card,
        .fifo-main-tabs > div,
        .fifo-sub-tabs > div,
        .fifo-section-tabs > div {
          width: 100%;
          max-width: 100%;
        }
      `}</style>

      {/* Main Currency Tabs */}
      <Tabs
        activeKey={mainTabKey}
        onChange={(key: string) => {
          setMainTabKey(key as CurrencyTab);          
          const subTabs = getSubTabs(key as CurrencyTab);
          setSubTabKey(subTabs.length ? (subTabs[0].key as SubTab) : "JPY");
        }}
        type="card"
        size="large"
        className="mb-6 fifo-main-tabs"
      >
        {(["JPY", "USD"] as CurrencyTab[]).map((mainTab) => (
          <TabPane tab={mainTab === "JPY" ? "Tuyến VN -> JP" : "Tuyến VN -> US"} key={mainTab}>
            {/* Sub-tabs */}
            <FifoBalanceCards JP={mainTab.includes('JP')} US={mainTab.includes('US')} />
            <Tabs
              activeKey={subTabKey}
              onChange={(key: string) => {
                setSubTabKey(key as SubTab);
              }}
              type="card"
              size="large"
              className="fifo-sub-tabs"
            >
              {getSubTabs(mainTab).map((sub) => (
                <TabPane tab={sub.label} key={sub.key}>
                  {renderSubTabPanelWithSectionTabs(sub.key as SubTab)}
                </TabPane>
              ))}
            </Tabs>
          </TabPane>
        ))}
      </Tabs>

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
              currencyCode === "KG"
                ? t("partnerManage.unit")
                : t("partnerManage.currencyCode")
            }
          >
            <Input value={currencyCode} disabled size="large" />
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
            label={currencyCode.includes("PT") ? t("partnerManage.amountMoney") : t("partnerManage.amount")}
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
              ...(transactionType === "outgoing" && currentBalance && currencyCode !== "PT"
                ? [
                    {
                      validator: (_: any, value: number) => {
                        if (value > currentBalance.fifoBalance) {
                          return Promise.reject(
                            new Error(
                              `${t(
                                "partnerManage.fifoBalance"
                              )}: ${currentBalance.fifoBalance.toLocaleString()} ${currencyCode}`
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
              transactionType === "outgoing" && currentBalance && !currencyCode.includes("PT") ? (
                <span className="text-sm text-gray-500">
                  {t("partnerManage.fifoBalance")}:{" "}
                  {currentBalance.fifoBalance.toLocaleString()} {currencyCode}
                </span>
              ) : null
            }
          >
            <InputNumber
              placeholder={
                currencyCode.includes("PT")
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
          {!currencyCode.includes("PT") && (
            <Form.Item
              label={
                currencyCode === "KG"
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
