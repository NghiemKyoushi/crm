"use client";

import { Modal } from "antd";

interface TransactionDetailModalProps {
  open: boolean;
  onCancel: () => void;
  transaction: {
    code: string;
    customer: string;
    amount: number;
    status: "PENDING" | "COMPLETED" | "CANCELLED";
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export default function TransactionCompleteModal({
  open,
  onCancel,
  transaction,
}: TransactionDetailModalProps) {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN") + " VNĐ";

  const getStatusBadge = () => {
    switch (transaction.status) {
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
            Chờ xử lý
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
            Đã hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
            Đã hủy
          </span>
        );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={600}
      className="rounded-xl"
      title={<h2 className="text-lg font-semibold">Chi tiết Giao dịch Rút tiền</h2>}
    >
      <div className="space-y-4">
        {/* Thông tin giao dịch */}
        <div className="bg-gray-50 rounded-lg p-3 mr-[50%]">
          <h3 className="font-semibold mb-3">Thông tin Giao dịch</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Mã yêu cầu:</span>{" "}
              {transaction.code}
            </p>
            <p>
              <span className="font-medium">Khách hàng:</span>{" "}
              {transaction.customer}
            </p>
            <p>
              <span className="font-medium">Số tiền:</span>{" "}
              <span className="text-red-600 font-semibold">
                {formatCurrency(transaction.amount)}
              </span>
            </p>
            <p>
              <span className="font-medium">Trạng thái:</span>{" "}
              {getStatusBadge()}
            </p>
          </div>
        </div>

        {/* Thông tin tài khoản nhận */}
        <div className="bg-blue-50  rounded-lg p-3 mr-[50%]">
          <h3 className="font-semibold mb-3">Thông tin Tài khoản Nhận</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Ngân hàng:</span>{" "}
              {transaction.bankName}
            </p>
            <p>
              <span className="font-medium">Số tài khoản:</span>{" "}
              {transaction.accountNumber}
            </p>
            <p>
              <span className="font-medium">Chủ tài khoản:</span>{" "}
              {transaction.accountHolder}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
