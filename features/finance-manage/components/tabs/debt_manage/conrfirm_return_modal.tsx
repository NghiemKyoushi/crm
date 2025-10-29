import { Modal } from "antd";


// Modal confirm "Yêu cầu hoàn trả"
export const ConfirmReturnModal = ({
    visible,
    onCancel,
    onConfirm,
    record
  }: {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    record: any;
  }) => {
    return (
      <Modal
        open={visible}
        onCancel={onCancel}
        onOk={onConfirm}
        okText="Xác nhận yêu cầu"
        cancelText="Huỷ"
        title="Xác nhận yêu cầu hoàn trả"
        centered
      >
        <div>
          <div className="font-semibold text-base mb-2 text-green-600">
            Bạn chắc chắn muốn gửi yêu cầu hoàn trả số dư?
          </div>
          <div className="text-sm mb-1">
            <b>Đối tác:</b> {record?.name}
          </div>
          <div className="text-sm mb-1">
            <b>Số dư thừa cần hoàn:</b>{" "}
            <span className="text-green-600 font-semibold">
              {record?.surplus?.toLocaleString()} ₫
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Ghi chú: Hệ thống sẽ gửi yêu cầu hoàn trả tới đối tác.
          </div>
        </div>
      </Modal>
    );
  };