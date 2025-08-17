"use client";

import React from "react";
import { Modal, Tabs, Button } from "antd";
import HistoryOrderTab from "./tab/history-order";
import HistoryPaymentTab from "./tab/history-payment";
import ShippingFeeConfig from "./tab/fee-privacy-setting";

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
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      className="p-4"
      title={
        <span className="font-semibold text-lg">
          Chi tiết Khách hàng:{" "}
          <span className="text-blue-600">{customer.name}</span>
        </span>
      }
      bodyStyle={{
        maxHeight: "70vh",   // Chiều cao tối đa ~70% màn hình
        overflowY: "auto",   // Cho phép scroll dọc
      }}
    >
      <Tabs defaultActiveKey="overview">
        <TabPane tab="Tổng quan" key="overview">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white shadow rounded p-4 text-center">
              <div className="text-gray-500 text-sm">Tổng số Đơn hàng</div>
              <div className="font-bold text-lg">{customer.totalOrders}</div>
            </div>
            <div className="bg-white shadow rounded p-4 text-center mr-[1px]">
              <div className="text-gray-500 text-sm">Tổng chi tiêu</div>
              <div className="font-bold text-lg">
                {customer.totalSpent.toLocaleString()}đ
              </div>
            </div>
            <div className="bg-white shadow rounded p-4 text-center">
              <div className="text-gray-500 text-sm">Công nợ hiện tại</div>
              <div className="font-bold text-lg text-red-600">
                {customer.debt.toLocaleString()}đ
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-center gap-4">
            {/* Thông tin địa chỉ */}
            <div className="!flex-7/12">
              <div className="bg-white shadow rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Sổ địa chỉ</span>
                  <Button type="link" className="text-blue-600 p-0">
                    + Thêm địa chỉ
                  </Button>
                </div>
                <div className="text-sm">
                  <div className="font-bold">Nhà riêng</div>
                  <div>{customer.address}</div>
                  <div>{customer.phone}</div>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                    Mặc định
                  </span>
                </div>
              </div>
              <div className="bg-white shadow rounded p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Tài khoản ngân hàng</span>
                  <Button type="link" className="text-blue-600 p-0">
                    + Thêm tài khoản
                  </Button>
                </div>
                <div className="text-sm">
                  <div className="font-bold">{customer.bank.name}</div>
                  <div>STK: {customer.bank.accountNumber}</div>
                  <div>Chủ TK: {customer.bank.owner}</div>
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ & nhân viên */}
            <div className="!flex-3/12 flex flex-col gap-4">
              <div className="bg-white shadow rounded p-4">
                <div className="font-semibold">Thông tin liên hệ</div>
                <div className="text-sm">{customer.email}</div>
                <div className="text-sm">{customer.phone}</div>
              </div>

              <div className="bg-white shadow rounded p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">Nhân viên phụ trách</div>
                  <div className="text-sm">{customer.salesPerson}</div>
                  <div className="text-xs text-gray-400">Sales Manager</div>
                </div>
                <Button type="link" className="text-blue-600 p-0">
                  Thay đổi
                </Button>
              </div>
            </div>
          </div>
        </TabPane>

        <TabPane tab="Lịch sử Đơn hàng" key="orders">
          <HistoryOrderTab/>
        </TabPane>

        <TabPane tab="Lịch sử Giao dịch" key="transactions">
          <HistoryPaymentTab/>
        </TabPane>

        <TabPane tab="Cài đặt Phí riêng" key="fees">
          <ShippingFeeConfig/>
        </TabPane>

        <TabPane tab="Ghi chú Nội bộ" key="notes">
          <div>Coming soon...</div>
        </TabPane>
      </Tabs>
    </Modal>
  );
}
