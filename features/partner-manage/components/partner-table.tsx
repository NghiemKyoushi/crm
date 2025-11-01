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

const { TabPane } = Tabs;
const { Option } = Select;

type TransactionType = "incoming" | "outgoing";

export default function FIFOMaterialManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // State
  const [activeTab, setActiveTab] = useState<string>("JPY");
  const [activeSubTab, setActiveSubTab] = useState<string>("transactions");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("incoming");
  const [page, setPage] = useState<number>(0);

  // Partner data using API call
  const {
    data: partnerData,
    isLoading: isPartnerLoading,
    isError: isPartnerError,
  } = useQuery({
    queryKey: ["partner-list", page],
    queryFn: () => getListPartner({ page, page_size: 10 }),
  });

  console.log('partnerData', partnerData);
  // Queries
  const { data: fifoBalanceData } = useFifoBalance();
  const createMutation = useCreateNewMaterial();

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        partnerId: values.partnerId,
        amount:
          transactionType === "incoming" ? values.amount : -Math.abs(values.amount),
        currencyCode: activeTab,
        exchangeRate: values.exchangeRate,
        note: values.note || undefined,
      };

      await createMutation.mutateAsync(payload);
      message.success(t("partnerManage.createMaterialSuccess"));

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
      message.error(
        error.response?.data?.message || t("common.error")
      );
    }
  };

  // Get balance for current currency
  const currentBalance = fifoBalanceData?.data?.find(
    (b) => b.currencyCode === activeTab
  );

  // Check if there's enough balance for outgoing transaction
  const handleTransactionTypeChange = (value: TransactionType) => {
    setTransactionType(value);
    if (value === "outgoing" && currentBalance) {
      Modal.info({
        title: t("partnerManage.fifoBalance"),
        content: (
          <div>
            <p>
              {t("partnerManage.fifoBalance")}: {currentBalance.fifoBalance.toLocaleString()}{" "}
              {activeTab}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t("partnerManage.note")}: {t("partnerManage.amountNegative")}
            </p>
          </div>
        ),
      });
    }
  };

  // Build partner select options
  const partnerOptions =
    (!isPartnerLoading && !isPartnerError && Array.isArray(partnerData.data)
      ? partnerData.data.map((partner: Partner) => ({
          label: `${partner.email}`,
          value: partner.id,
        }))
      : []) || [];

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
      <FifoBalanceCards />

      {/* Currency Tabs */}
      <style jsx global>{`
        /* Main tabs (JPY, USD) - Equal width */
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

        /* Sub tabs (Giao dịch, Lãi/Lỗ, Báo cáo) - Equal width */
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

        /* Ensure all content inherits full width */
        .fifo-main-tabs .ant-card,
        .fifo-sub-tabs .ant-card,
        .fifo-main-tabs > div,
        .fifo-sub-tabs > div {
          width: 100%;
          max-width: 100%;
        }
      `}</style>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setActiveSubTab("transactions");
        }}
        type="card"
        size="large"
        className="mb-6 fifo-main-tabs"
      >
        <TabPane tab={t("partnerManage.manageJPY")} key="JPY">
          <Tabs
            activeKey={activeSubTab}
            onChange={setActiveSubTab}
            type="card"
            size="large"
            className="fifo-sub-tabs"
          >
            <TabPane tab={t("partnerManage.transactionsTab")} key="transactions">
              <div className="fifo-content-area">
                <TransactionList
                  currencyCode="JPY"
                  onAddTransaction={() => setModalVisible(true)}
                />
              </div>
            </TabPane>
            <TabPane tab={t("partnerManage.profitLossTab")} key="profitloss">
              <div className="fifo-content-area">
                <ProfitLossSummaryComponent />
                <OrderProfitLossTable />
              </div>
            </TabPane>
            <TabPane tab={t("partnerManage.reportsTab")} key="reports">
              <div className="fifo-content-area">
                <ProfitLossChart />
              </div>
            </TabPane>
          </Tabs>
        </TabPane>

        <TabPane tab={t("partnerManage.manageUSD")} key="USD">
          <Tabs
            activeKey={activeSubTab}
            onChange={setActiveSubTab}
            type="card"
            size="large"
            className="fifo-sub-tabs"
          >
            <TabPane tab={t("partnerManage.transactionsTab")} key="transactions">
              <div className="fifo-content-area">
                <TransactionList
                  currencyCode="USD"
                  onAddTransaction={() => setModalVisible(true)}
                />
              </div>
            </TabPane>
            <TabPane tab={t("partnerManage.profitLossTab")} key="profitloss">
              <div className="fifo-content-area">
                <ProfitLossSummaryComponent />
                <OrderProfitLossTable />
              </div>
            </TabPane>
            <TabPane tab={t("partnerManage.reportsTab")} key="reports">
              <div className="fifo-content-area">
                <ProfitLossChart />
              </div>
            </TabPane>
          </Tabs>
        </TabPane>
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
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
        >
          {/* Transaction Type */}
          <Form.Item
            label={t("partnerManage.transactionType")}
            required
          >
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

          {/* Currency (read-only, based on tab) */}
          <Form.Item label={t("partnerManage.currencyCode")}>
            <Input value={activeTab} disabled size="large" />
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
                if (typeof label === 'string') {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
              options={partnerOptions}
              notFoundContent={
                isPartnerLoading ? <Spin size="small" /> : null
              }
              // If paging needed: onPopupScroll, etc.
            />
          </Form.Item>

          {/* Amount */}
          <Form.Item
            label={t("partnerManage.amount")}
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
              ...(transactionType === "outgoing" && currentBalance
                ? [
                    {
                      validator: (_: any, value: number) => {
                        if (value > currentBalance.fifoBalance) {
                          return Promise.reject(
                            new Error(
                              `${t("partnerManage.fifoBalance")}: ${currentBalance.fifoBalance.toLocaleString()} ${activeTab}`
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
              transactionType === "outgoing" && currentBalance ? (
                <span className="text-sm text-gray-500">
                  {t("partnerManage.fifoBalance")}:{" "}
                  {currentBalance.fifoBalance.toLocaleString()} {activeTab}
                </span>
              ) : null
            }
          >
            <InputNumber
              placeholder={t("partnerManage.enterAmount")}
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
          <Form.Item
            label={t("partnerManage.exchangeRateLabel")}
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

          {/* Note */}
          <Form.Item
            label={t("partnerManage.noteLabel")}
            name="note"
          >
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