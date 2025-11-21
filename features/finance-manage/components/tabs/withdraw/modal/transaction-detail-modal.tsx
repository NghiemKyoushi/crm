/* eslint-disable @next/next/no-img-element */
"use client";

import { Modal, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getDetailWithdraw } from "@/features/finance-manage/apis";
import { withdrawModel } from "@/types/deposit-type";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface TransactionDetailModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onReject: () => void;
  isTransacted: boolean;
  onComplete: () => void;
  selectId: number | null;
}

export default function TransactionDetailModal({
  open,
  onCancel,
  onConfirm,
  onReject,
  isTransacted,
  onComplete,
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
      width={650}
      centered
      className="rounded-xl"
      title={
        <h2 className="text-lg font-semibold">Chi tiết Giao dịch Rút tiền</h2>
      }
    >
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {/* Thông tin giao dịch */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Thông tin Giao dịch</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Mã yêu cầu:</span>{" "}
                {withdrawDetail?.depositCode}
              </p>
              <p>
                <span className="font-medium">Khách hàng:</span>{" "}
                {withdrawDetail?.userName} ({withdrawDetail?.userId})
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
                {/* <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                  Chờ xử lý
                </span> */}
              </p>
            </div>
          </div>

          {/* Thông tin tài khoản nhận */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
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
                <span className="font-medium">Chủ tài khoản:</span>
                {withdrawDetail?.accountHolderName}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {isTransacted ? (
              <Button
                className="!bg-green-500 !text-white !border-none hover:!bg-green-600"
                onClick={() => onComplete()}
              >
                ✓ Đã chuyển
              </Button>
            ) : (
              <Button
                className="!bg-green-500 !text-white !border-none hover:!bg-green-600"
                onClick={() => onConfirm()}
              >
                ✓ Xác nhận Chuyển tiền
              </Button>
            )}
            <Button
              className="!bg-red-500 !text-white !border-none hover:!bg-red-600"
              onClick={() => onReject()}
            >
              ✕ Từ chối
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {/* QR Code */}
          <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 h-60">
            {withdrawDetail?.qrCode ? (
              <>
                <img
                  src={withdrawDetail.qrCode}
                  alt="QR Code"
                  className="w-48 h-48 object-contain cursor-pointer" // tăng lên từ w-40 h-40
                />
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="!mt-3"
                  size="small"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = withdrawDetail.qrCode;
                    link.download = "qr-code.png";
                    link.click();
                  }}
                >
                  Tải xuống QR
                </Button>
              </>
            ) : (
              <>
                <span className="text-gray-400">Mã QR Chuyển khoản</span>
                <p className="text-sm text-gray-500 mt-2">
                  Quét mã QR để chuyển khoản nhanh
                </p>
              </>
            )}
          </div>

          {/* Hướng dẫn */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2">
            <h3 className="font-semibold mb-2 text-sm">
              Hướng dẫn Chuyển khoản
            </h3>
            <ol className="list-decimal list-inside text-xs space-y-0.5 text-gray-700">
              <li>Mở ứng dụng ngân hàng</li>
              <li>Chọn Chuyển khoản → Quét mã QR</li>
              <li>Quét mã QR hoặc nhập thông tin thủ công</li>
              <li>Kiểm tra thông tin và xác nhận chuyển</li>
              <li>Lưu lại biên lai để đối soát</li>
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
}
