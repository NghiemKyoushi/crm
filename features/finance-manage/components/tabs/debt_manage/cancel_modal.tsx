import { Input, Modal } from "antd";
import React, { useState } from "react";

export const RejectActionModal = ({ visible, onOk, onCancel, record }: any) => {
  const [reason, setReason] = useState("");

  const handleOk = () => {
    onOk && onOk(); 
    setReason(""); 
  };

  const handleCancel = () => {
    onCancel && onCancel();
    setReason("");
  };

  return (
    <Modal
      open={visible}
      title="Từ chối giao dịch"
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Từ chối"
      okButtonProps={{ danger: true }}
      cancelText="Huỷ"
      destroyOnClose
      centered
    >
      <div>
        Bạn chắc chắn muốn <span className="text-red-600"><b>TỪ CHỐI</b></span> giao dịch của đối tác <b>{record?.name}</b>?
      </div>
      {/* <div className="mt-4">
        <span className="font-medium text-[12px]">Lý do từ chối</span>
        <Input.TextArea
          placeholder="Nhập lý do từ chối..."
          className="mt-1"
          autoSize={{ minRows: 2, maxRows: 4 }}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </div> */}
    </Modal>
  );
};