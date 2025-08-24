import { Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ReactNode } from "react";

interface UnassignConfirmProps {
  open: boolean;
  title?: string;
  content?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function PopupUnassignConfirm({
  open,
  title = "Xác nhận huỷ gán",
  content = "Bạn có chắc chắn muốn huỷ gán khách hàng này khỏi nhân viên sale?",
  onConfirm,
  onCancel,
  confirmText = "Huỷ gán",
  cancelText = "Đóng",
  loading = false,
}: UnassignConfirmProps) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={360}
      className="rounded-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <DeleteOutlined className="text-3xl !text-red-500" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-600">{content}</p>

        <div className="flex gap-3 mt-4 w-full justify-center">
          <button
            className="min-w-[100px] px-5 py-2.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition text-base"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="min-w-[100px] px-5 py-2.5 rounded-md font-medium transition !text-white bg-red-500 hover:bg-red-600"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
