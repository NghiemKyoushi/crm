import { TransactionHistory } from "@/types/deposit-type";
import { Modal } from "antd";
import dayjs from "dayjs";

interface TransactionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  histories: TransactionHistory[];
}

export const renderTransactionStatus = (status: string): string => {
    switch (status) {
      case "WAITING_CONFIRMATION":
        return "Chờ xử lý";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      default:
        return status; // fallback nếu có trạng thái khác
    }
  };

export default function TransactionHistoryModal({
  open,
  onClose,
  transactionId,
  histories,
}: TransactionHistoryModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      className="rounded-xl"
      title={
        <div className="text-xl font-semibold">
          Lịch sử Giao dịch:{" "}
          <span className="text-blue-600 font-bold">{transactionId}</span>
        </div>
      }
    >
      <div className="flex flex-col gap-6 mt-2">
        {histories.map((item, index) => (
          <div key={index} className="flex gap-3">
            {/* Dot + Line */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
              {index !== histories.length - 1 && (
                <div className="flex-1 w-[2px] bg-gray-200" />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="font-medium">{renderTransactionStatus(item.new_status)}</span>
                <span className="text-gray-500 text-sm">
                  - {dayjs(item.action_at).format("DD-MM-YYYY")}
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                Người thực hiện: <span className="font-medium">{item.username}</span>
              </div>

              {/* {item.note && ( */}
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 border border-gray-100">
                  <span className="font-medium">Ghi chú/Lý do:</span> {item.note ? item.note : "Tạo lệnh nạp thủ công" }
                </div>
              {/* )} */}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-6">
        <button
          className="px-5 py-2.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
}
