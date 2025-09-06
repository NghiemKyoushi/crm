"use client";

import { Modal, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

interface TransactionDetailModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onReject: () => void;
  isTransacted: boolean;
  onComplete: () => void;
}

export default function TransactionDetailModal({
  open,
  onCancel,
  onConfirm,
  onReject,
  isTransacted,
  onComplete,
}: TransactionDetailModalProps) {
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
                <span className="font-medium">Mã yêu cầu:</span> R-0805-1
              </p>
              <p>
                <span className="font-medium">Khách hàng:</span> Lê Văn C
                (KH004)
              </p>
              <p>
                <span className="font-medium">Số tiền:</span>{" "}
                <span className="text-red-600 font-semibold">
                  2,500,000 VNĐ
                </span>
              </p>
              <p>
                <span className="font-medium">Trạng thái:</span>{" "}
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                  Chờ xử lý
                </span>
              </p>
            </div>
          </div>

          {/* Thông tin tài khoản nhận */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Thông tin Tài khoản Nhận</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Ngân hàng:</span> Vietcombank
              </p>
              <p>
                <span className="font-medium">Số tài khoản:</span> 0123456789012
              </p>
              <p>
                <span className="font-medium">Chủ tài khoản:</span> LE VAN C
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
          <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 h-56">
            <span className="text-gray-400">Mã QR Chuyển khoản</span>
            <p className="text-sm text-gray-500 mt-2">
              Quét mã QR để chuyển khoản nhanh
            </p>
            <Button type="primary" icon={<DownloadOutlined />} className="mt-3">
              Tải xuống QR
            </Button>
          </div>

          {/* Hướng dẫn */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Hướng dẫn Chuyển khoản</h3>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
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
