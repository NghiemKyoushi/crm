"use client";
import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Button, Spin } from "antd";
import type { SelectProps } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { getTelesaleAccounts } from "../apis/telesale-mng"; 

const { TextArea } = Input;

// Định nghĩa kiểu cho telesale account trả về từ API
type TelesaleAccount = {
  phonenumber: string;
  createdat: string;
  isactive: boolean;
  id: number;
  fullname: string;
  email: string;
};

type AssignCustomerModalProps = {
  open: boolean;
  onCancel: () => void;
  // Sửa lại hàm onSubmit để nhận đúng dạng @file_context_0 (AssignSaleModel)
  onSubmit: (values: { note: string; prospect_ids: number[]; sale_id: number }) => void;
};

const AssignTelesaleModal: React.FC<AssignCustomerModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [telesale, setTelesale] = useState<number | undefined>(undefined);
  const [note, setNote] = useState<string>("");
  const [telesaleAccounts, setTelesaleAccounts] = useState<TelesaleAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noteError, setNoteError] = useState<string>("");

  // Chuẩn bị option cho Select:
  const telesaleOptions: SelectProps["options"] = telesaleAccounts.map((account) => ({
    label: `${account.fullname} (${account.phonenumber}) - ${account.email}`,
    value: account.id,
  }));
  // Clear form fields when modal is closed
  useEffect(() => {
    if (!open) {
      setTelesale(undefined);
      setNote("");
      setNoteError("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getTelesaleAccounts()
        .then((accounts) => {
          setTelesaleAccounts(accounts || []);
        })
        .catch(() => {
          setTelesaleAccounts([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleOk = () => {
    // note là trường required
    if (typeof telesale !== "number") return;
    if (!note.trim()) {
      setNoteError("Vui lòng nhập ghi chú!");
      return;
    }
    setNoteError("");
    // Chuẩn hoá dữ liệu theo AssignSaleModel: { note: string, prospectIds: number[], saleId: number }
    // Ở đây chỉ assign 1 khách hàng nên prospectIds chỉ có 1 phần tử, sử dụng telesale là saleId
    const submitData = {
      note: note,
      prospect_ids: [],
      sale_id: telesale,
    };
    onSubmit(submitData);
    // Clear data after submit
    setTelesale(undefined);
    setNote("");
  };

  const handleCancel = () => {
    onCancel();
    setTelesale(undefined);
    setNote("");
    setNoteError("");
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
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
        <label className="block mb-1 font-medium">
          Chọn Telesale <span className="text-red-500">*</span>
        </label>
        <Spin spinning={loading}>
          <Select
            value={telesale}
            onChange={(val) => setTelesale(val as number)}
            placeholder="-- Chọn Telesale --"
            className="!w-full !h-11"
            showSearch
            options={telesaleOptions}
          />
        </Spin>
      </div>

      {/* Ghi chú */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">
          Ghi chú <span className="text-red-500">*</span>
        </label>
        <TextArea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (e.target.value.trim()) setNoteError("");
          }}
          placeholder="Ghi chú về việc gán khách hàng..."
          rows={3}
          status={noteError ? "error" : undefined}
        />
        {noteError && (
          <div className="text-red-500 text-xs mt-1">{noteError}</div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleCancel}>Hủy</Button>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleOk}
          disabled={typeof telesale !== "number" || loading}
        >
          Gán khách hàng
        </Button>
      </div>
    </Modal>
  );
};

export default AssignTelesaleModal;
