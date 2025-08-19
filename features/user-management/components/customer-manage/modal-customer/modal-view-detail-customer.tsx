"use client";

import React from "react";
import { Modal, Tabs, Button } from "antd";
import HistoryOrderTab from "./tab/history-order";
import HistoryPaymentTab from "./tab/history-payment";
import ShippingFeeConfig from "./tab/fee-privacy-setting";
import Notes from "./tab/internal-note";
import OverviewTab from "./tab/overview-customer";
import { useTranslation } from "react-i18next";

interface CustomerDetailModalProps {
  visible: boolean;
  onClose: () => void;
  customer: {
    name: string;
    totalOrders: number;
    totalSpent: number;
    debt: number;
    address: string;
    phone: string;
    email: string;
    salesPerson: string;
    bank: {
      name: string;
      accountNumber: string;
      owner: string;
    };
  };
}

const { TabPane } = Tabs;

export default function CustomerDetailModal({
  visible,
  onClose,
  customer,
}: CustomerDetailModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      className="p-4"
      title={
        <span className="font-semibold text-lg">
          {t("customerManage.detailTitle")}
          <span className="text-blue-600">{customer.name}</span>
        </span>
      }
      bodyStyle={{
        maxHeight: "70vh", // Chiều cao tối đa ~70% màn hình
        overflowY: "auto", // Cho phép scroll dọc
      }}
    >
      <Tabs defaultActiveKey="overview">
        <TabPane tab={t("customerManage.tabs.overview")} key="overview">
          <OverviewTab customer={customer} />
        </TabPane>

        <TabPane tab={t("customerManage.tabs.orders")} key="orders">
          <HistoryOrderTab />
        </TabPane>

        <TabPane tab={t("customerManage.tabs.transactions")} key="transactions">
          <HistoryPaymentTab />
        </TabPane>

        <TabPane tab={t("customerManage.tabs.fees")} key="fees">
          <ShippingFeeConfig />
        </TabPane>

        <TabPane tab={t("customerManage.tabs.notes")} key="notes">
          <Notes />
        </TabPane>
      </Tabs>
    </Modal>
  );
}
