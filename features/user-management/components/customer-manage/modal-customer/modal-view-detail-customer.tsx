"use client";

import React, { useEffect, useState } from "react";
import { Modal, Tabs, Button } from "antd";
import HistoryOrderTab from "./tab/history-order";
import HistoryPaymentTab from "./tab/history-payment";
import ShippingFeeConfig from "./tab/fee-privacy-setting";
import Notes from "./tab/internal-note";
import OverviewTab from "./tab/overview-customer";
import { useTranslation } from "react-i18next";
import {
  addressModel,
  bankAccountModel,
  CustomerDetail,
} from "@/types/customer-type";
import {
  useAddAddress,
  useAddBank,
  useDefaultAddress,
  useDetailCustomer,
} from "@/features/user-management/hooks/staff-manage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { getDetailCustomer } from "@/features/user-management/apis/staff-manage";

interface CustomerDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedId: string;
}

const { TabPane } = Tabs;

export default function CustomerDetailModal({
  visible,
  onClose,
  selectedId,
}: CustomerDetailModalProps) {
  const { t } = useTranslation();
  const { data: customerDetail } = useDetailCustomer(selectedId);
  const addBankMutation = useAddBank();
  const addAddressMutation = useAddAddress();
  const addDefaultAddressMutation = useDefaultAddress();
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState<CustomerDetail>();
  useEffect(() => {
    if (customerDetail) setCustomer(customerDetail);
  }, [customerDetail]);

  const handleSubmitDataAddressDetail = (data: addressModel) => {
    addAddressMutation.mutate(
      { data, id: selectedId },
      {
        onSuccess: async () => {
          toast.success("Tạo địa chỉ mới thành công!");
          const updatedCustomer = await queryClient.fetchQuery({
            queryKey: ["detailCustomer", selectedId],
            queryFn: () => getDetailCustomer(selectedId),
          });
          setCustomer(updatedCustomer);
        },
        onError: () => {
          toast.error("Tạo địa chỉ mới thất bại");
        },
      }
    );
  };

  const handleSubmitDataBankDetail = (data: bankAccountModel) => {
    addBankMutation.mutate(
      { data, id: selectedId },
      {
        onSuccess: async () => {
          toast.success("Thêm tài khoản mới thành công!");
          const updatedCustomer = await queryClient.fetchQuery({
            queryKey: ["detailCustomer", selectedId],
            queryFn: () => getDetailCustomer(selectedId),
          });
          setCustomer(updatedCustomer);
        },
        onError: () => {
          toast.error("Thêm tài khoản mới thất bại");
        },
      }
    );
  };

  const handleSetDefaultAddress = (addressId: string) => {
    addDefaultAddressMutation.mutate(
      { address_id: +addressId, id: selectedId },
      {
        onSuccess: async () => {
          toast.success("Cập nhật địa chỉ mặc định thành công!");
          const updatedCustomer = await queryClient.fetchQuery({
            queryKey: ["detailCustomer", selectedId],
            queryFn: () => getDetailCustomer(selectedId),
          });
          setCustomer(updatedCustomer);
        },
        onError: () => {
          toast.error("Cập nhật địa chỉ mặc định thất bại");
        },
      }
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      className="p-4"
      title={
        <span className="font-semibold text-lg flex justify-items-start gap-3 ">
          <span>{t("customerManage.detailTitle")}</span>
          <span className="text-blue-600">
            {customer && customer.user_profile.full_name}
          </span>
        </span>
      }
      bodyStyle={{
        maxHeight: "75vh", 
        overflowY: "auto", 
      }}
    >
      <Tabs defaultActiveKey="overview">
        <TabPane tab={t("customerManage.tabs.overview")} key="overview">
          {customer && (
            <OverviewTab
              handleSubmitDataAddressDetail={handleSubmitDataAddressDetail}
              handleSubmitDataBankDetail={handleSubmitDataBankDetail}
              customer={customer}
              handleSetDefaultAddress={handleSetDefaultAddress}
            />
          )}
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
          <Notes selectedId={selectedId} />
        </TabPane>
      </Tabs>
    </Modal>
  );
}
