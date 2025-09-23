"use client";
import React, { useState } from "react";
import { Modal, Select, Input, Button } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

type AssignCustomerModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { telesaleId: string; note?: string }) => void;
};

const AssignTelesaleModal: React.FC<AssignCustomerModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [telesale, setTelesale] = useState<string | undefined>(undefined);
  const [note, setNote] = useState<string>("");

  const handleOk = () => {
    if (!telesale) return;
    onSubmit({ telesaleId: telesale, note });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      title={<span className="font-bold text-lg">Gán khách hàng cho Telesale</span>}
    >
      {/* Thông báo số khách hàng */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-4 py-4 mb-4 mt-3">
        <span className="text-sm text-blue-800 font-medium">
          Đã chọn 1 khách hàng để gán
        </span>
      </div>

      {/* Chọn telesale */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Chọn Telesale <span className="text-red-500">*</span></label>
        <Select
          value={telesale}
          onChange={(val) => setTelesale(val)}
          placeholder="-- Chọn Telesale --"
          className="!w-full !h-11"
        >
          <Option value="1">Nguyễn Văn A</Option>
          <Option value="2">Trần Thị B</Option>
        </Select>
      </div>

      {/* Ghi chú */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Ghi chú</label>
        <TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú về việc gán khách hàng..."
          rows={3}
        />
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Hủy</Button>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleOk}
          disabled={!telesale}
        >
          Gán khách hàng
        </Button>
      </div>
    </Modal>
  );
};

export default AssignTelesaleModal;
