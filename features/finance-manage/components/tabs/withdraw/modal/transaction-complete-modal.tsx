"use client";

import { getDetailWithdraw } from "@/features/finance-manage/apis";
import { withdrawModel } from "@/types/deposit-type";
import { Modal } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TransactionDetailModalProps {
  open: boolean;
  onCancel: () => void;
  selectId: number | null;
}

export default function TransactionCompleteModal({
  open,
  onCancel,
  selectId,
}: TransactionDetailModalProps) {
  const [withdrawDetail, setWithdrawDetail] = useState<withdrawModel | null>(
    null
  );
  const { t } = useTranslation();

  useEffect(() => {
    const fetchWithdrawDetail = async () => {
      if (!open || !selectId) return;
      try {
        const data = await getDetailWithdraw(Number(selectId));
        setWithdrawDetail(data);
      } catch (error) {
        console.error("Error fetching withdraw detail:", error);
      }
    };

    fetchWithdrawDetail();
  }, [open, selectId]);

  const getStatusBadge = () => {
    if (withdrawDetail) {
      switch (withdrawDetail.status) {
        case "PENDING":
          return (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
              {t("withdraw.statusType.pending")}
            </span>
          );
        case "COMPLETED":
          return (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
              {t("withdraw.statusType.completed")}
            </span>
          );
        case "APPROVED":
          return (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
              {t("withdraw.statusType.approved")}
            </span>
          );
        case "CANCELLED":
          return (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
              {t("withdraw.statusType.cancelled")}
            </span>
          );
        case "REJECTED":
          return (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
              {t("withdraw.statusType.rejected")}
            </span>
          );
      }
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
      title={
        <h2 className="text-lg font-semibold">Chi tiết Giao dịch Rút tiền</h2>
      }
    >
      <div className="flex flex-row gap-4">
        <div className="bg-gray-50 rounded-lg p-3 flex-1">
          <h3 className="font-semibold mb-3">Thông tin Giao dịch</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Mã yêu cầu:</span>{" "}
              {withdrawDetail?.id}
            </p>
            <p>
              <span className="font-medium">Khách hàng:</span>{" "}
              {withdrawDetail?.userName} ({withdrawDetail?.userId}){" "}
            </p>
            <p>
              <span className="font-medium">Số tiền:</span>{" "}
              <span className="text-red-600 font-semibold">
                {withdrawDetail?.amount.toLocaleString()} VNĐ
              </span>
            </p>
            <p>
              <span className="font-medium">Trạng thái:</span>{" "}
              {getStatusBadge()}
            </p>
          </div>
        </div>

        {/* Thông tin tài khoản nhận */}
        <div className="bg-blue-50  rounded-lg p-3 flex-1">
          <h3 className="font-semibold mb-3">Thông tin Tài khoản Nhận</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Ngân hàng:</span>{" "}
              {withdrawDetail?.bankName}
            </p>
            <p>
              <span className="font-medium">Số tài khoản:</span>{" "}
              {withdrawDetail?.accountNumber}
            </p>
            <p>
              <span className="font-medium">Chủ tài khoản:</span>{" "}
              {withdrawDetail?.accountHolderName}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
