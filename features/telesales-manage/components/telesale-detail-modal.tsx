"use client";
import React from "react";
import { Modal, Button, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";

type CallHistory = {
  id: string;
  title: string;
  datetime: string;
  staff: string;
  note: string;
  status: "success" | "called";
};

type CustomerDetailModalProps = {
  open: boolean;
  onCancel: () => void;
  onEdit: () => void;
  customer: {
    name: string;
    gender: string;
    dob: string;
    phone: string;
    address: string;
  };
  callHistory: CallHistory[];
};

const TelesaleDetailModal: React.FC<CustomerDetailModalProps> = ({
  open,
  onCancel,
  onEdit,
  customer,
  callHistory,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={700}
      title={<span className="font-bold text-lg">Chi tiết khách hàng</span>}
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Thông tin khách hàng */}
        <div>
          <h3 className="font-medium mb-3 border-b pb-2">Thông tin khách hàng</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Họ tên:</span> {customer.name}
            </p>
            <p>
              <span className="font-medium">Giới tính:</span> {customer.gender}
            </p>
            <p>
              <span className="font-medium">Ngày sinh:</span> {customer.dob}
            </p>
            <p>
              <span className="font-medium">Số điện thoại:</span> {customer.phone}
            </p>
            <p>
              <span className="font-medium">Địa chỉ:</span> {customer.address}
            </p>
          </div>
        </div>

        {/* Lịch sử cuộc gọi */}
        <div>
          <h3 className="font-medium mb-3 border-b pb-2">Lịch sử cuộc gọi</h3>
          <div className="space-y-3">
            {callHistory.map((call) => (
              <div
                key={call.id}
                className={`rounded-md p-3 border ${
                  call.status === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-medium ${
                      call.status === "success" ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {call.title}
                  </span>
                  {call.status === "success" ? (
                    <Tag color="green">Thành công</Tag>
                  ) : (
                    <Tag color="orange">Đã gọi</Tag>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  {call.datetime} – {call.staff}
                </p>
                <p className="text-sm">{call.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={onCancel}>Đóng</Button>
        <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
          Chỉnh sửa
        </Button>
      </div>
    </Modal>
  );
};

export default TelesaleDetailModal;
