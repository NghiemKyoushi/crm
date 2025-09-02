import { Modal } from "antd";
import {
  ExclamationCircleOutlined,
  LockOutlined,
  DeleteOutlined,
  KeyOutlined,
  UnlockOutlined, 
  CheckCircleOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";

type ConfirmType = "reset" | "lock" | "delete" | "unlock" | "default" | "confirm"; // 👈 thêm unlock

interface ConfirmModalProps {
  open: boolean;
  type?: ConfirmType;
  title?: string;
  content?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function PopupConfirm({
  open,
  type = "default",
  title = "Xác nhận",
  content = "Bạn có chắc chắn muốn thực hiện hành động này?",
  onConfirm,
  onCancel,
  confirmText = "Đồng ý",
  cancelText = "Huỷ",
  loading = false,
}: ConfirmModalProps) {
  const config: Record<
    ConfirmType,
    { icon: ReactNode; confirmBtn: string }
  > = {
    reset: {
      icon: <KeyOutlined className="text-3xl !text-gray-500" />,
      confirmBtn: "bg-gray-600 hover:bg-gray-700 text-white",
    },
    lock: {
      icon: <LockOutlined className="text-3xl !text-amber-500" />,
      confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    unlock: {
      icon: <UnlockOutlined className="text-3xl !text-green-500" />,
      confirmBtn: "bg-green-500 hover:bg-green-600 text-white",
    },
    delete: {
      icon: <DeleteOutlined className="text-3xl !text-red-500" />,
      confirmBtn: "bg-red-500 hover:bg-red-600 text-white",
    },
    default: {
      icon: <ExclamationCircleOutlined className="text-3xl !text-yellow-500" />,
      confirmBtn: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    confirm: {
      icon: <CheckCircleOutlined className="text-3xl !text-green-500" />, 
      confirmBtn: "bg-green-500 hover:bg-green-600 text-white",
    },
  };

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
        {config[type]?.icon || config["default"].icon}
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
            className={`min-w-[100px] px-5 py-2.5 rounded-md font-medium transition !text-white ${
              config[type]?.confirmBtn || config["default"].confirmBtn
            }`}
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
