"use client";

import React, { useEffect, useState } from "react";
import { Modal, Tabs, Button, Spin } from "antd"; // import Spin

import {
  useAddAddress,
  useAddBank,
  useCustomerForSale,
  useDefaultAddress,
  useDefaultBank,
} from "@/features/user-management/hooks/staff-manage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { getDetailCustomer } from "@/features/user-management/apis/staff-manage";

import TabPane from "antd/es/tabs/TabPane";
import OverviewTab from "../components/customer-manage/modal-customer/tab/overview-customer";
import { useTranslation } from "react-i18next";
import {
  addressModel,
  bankAccountModel,
  CustomerDetail,
} from "@/types/customer-type";
import { Employee } from "../components/sale-manage/modal-sales-add";
import Notes from "../components/customer-manage/modal-customer/tab/internal-note";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

export interface CustomerDetailProps {
  selectedId: string;
}
export default function CustomerDetailPages(props: CustomerDetailProps) {
  const { selectedId } = props;
  const { t } = useTranslation();
  const addBankMutation = useAddBank();
  const addAddressMutation = useAddAddress();
  const addDefaultAddressMutation = useDefaultAddress();
  const addDefaultBankMutation = useDefaultBank();
  const customerForSaleMutation = useCustomerForSale();

  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState<CustomerDetail>();
  const [loading, setLoading] = useState(false);

  // Fetch customer detail every time page is mounted or selectedId changes
  const fetchDetailCustomer = async () => {
    setLoading(true);
    try {
      const detail = await getDetailCustomer(selectedId);
      setCustomer(detail);
    } catch (error) {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleSubmitDataAddressDetail = (data: addressModel) => {
    addAddressMutation.mutate(
      { data, id: selectedId },
      {
        onSuccess: async () => {
          toast.success(t('toast.createAddressSuccess'));
          await fetchDetailCustomer();
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  const handleSubmitDataBankDetail = (data: bankAccountModel) => {
    addBankMutation.mutate(
      { data, id: selectedId },
      {
        onSuccess: async () => {
          toast.success(t('toast.addBankAccountSuccess'));
          await fetchDetailCustomer();
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  const handleSetDefaultAddress = (addressId: string) => {
    addDefaultAddressMutation.mutate(
      { address_id: +addressId, id: selectedId },
      {
        onSuccess: async () => {
          toast.success(t('toast.updateDefaultAddressSuccess'));
          await fetchDetailCustomer();
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  const handleSetDefaultBank = (bankId: string) => {
    addDefaultBankMutation.mutate(
      { bank_id: +bankId, id: selectedId },
      {
        onSuccess: async () => {
          toast.success(t('toast.updateDefaultBankSuccess'));
          await fetchDetailCustomer();
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  const handleChangeSaleAdd = (saleinfo: Employee) => {
    customerForSaleMutation.mutate(
      { customer_id: +selectedId, sale_id: +saleinfo.id },
      {
        onSuccess: async () => {
          toast.success(t('toast.updateSalesAssignmentSuccess'));
          await fetchDetailCustomer();
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  return (
    <>
      <Spin spinning={loading}>
        <div className="bg-white rounded-2xl shadow p-4 w-full mt-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faUserCircle}
                className="text-5xl text-blue-500"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {customer?.user_profile.full_name}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>ID: {customer?.user_profile.customer_code}</span>
                  {/* <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    VIP
                  </span> */}
                  <span>Sales: {customer?.sale_profile?.full_name}</span>
                  {/* <span>Ngày gia nhập: {customer?.user_profile.}</span> */}
                </div>
              </div>
            </div>
            {/* <div className="flex gap-2">
              <button className="bg-blue-500 hover:bg-blue-600 !text-white px-3 py-1 rounded-lg text-sm font-medium">
                Chỉnh sửa thông tin
              </button>
              <button className="border border-gray-300 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100">
                Quay lại
              </button>
            </div> */}
          </div>
          {/* Stats */}
          {customer && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {customer.total_orders}
                </p>
                <p className="text-gray-600 text-sm">{t("customerManage.customerOverview.totalOrders")}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {customer.total_expenses.toLocaleString()} VNĐ
                </p>
                <p className="text-gray-600 text-sm">{t("customerManage.customerOverview.totalSpent")}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {customer.debt_amount ? customer.debt_amount.toLocaleString() : 0} VNĐ
                </p>
                <p className="text-gray-600 text-sm">{t("customerManage.customerOverview.currentDebt")}</p>
              </div>
            </div>
          )}
        </div>
        <Tabs
          defaultActiveKey="overview"
          className="!bg-white !shadow !mt-4 !p-2 rounded-xl"
        >
          <TabPane tab={t("customerManage.tabs.overview")} key="overview">
            {customer ? (
              <OverviewTab
                handleSubmitDataAddressDetail={handleSubmitDataAddressDetail}
                handleSubmitDataBankDetail={handleSubmitDataBankDetail}
                customer={customer}
                handleSetDefaultAddress={handleSetDefaultAddress}
                handleSetDefaultBank={handleSetDefaultBank}
                handleChangeSaleAdd={handleChangeSaleAdd}
              />
            ) : (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Spin spinning={true} />
              </div>
            )}
          </TabPane>
          {/* 
          <TabPane tab={t("customerManage.tabs.orders")} key="orders">
            <HistoryOrderTab />
          </TabPane>

          <TabPane tab={t("customerManage.tabs.transactions")} key="transactions">
            <HistoryPaymentTab />
          </TabPane> */}

          {/* <TabPane tab={t("customerManage.tabs.fees")} key="fees">
            <ShippingFeeConfig />
          </TabPane> */}

          <TabPane tab={t("customerManage.tabs.notes")} key="notes">
            <Notes selectedId={selectedId} />
          </TabPane>
        </Tabs>
      </Spin>
    </>
  );
}
