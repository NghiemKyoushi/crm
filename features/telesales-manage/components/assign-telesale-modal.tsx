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
      width={550}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <UserAddOutlined className="text-white text-xl" />
          </div>
          <span className="font-bold text-xl text-gray-800">Gán khách hàng cho Telesale</span>
        </div>
      }
    >
      {/* Thông báo số khách hàng */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl px-5 py-4 mb-5 mt-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-blue-800 font-semibold">
          Đã chọn 1 khách hàng để gán
        </span>
      </div>

      {/* Chọn telesale */}
      <div className="mb-5">
        <label className="block mb-2 font-semibold text-gray-700 text-sm">
          Chọn Telesale <span className="text-red-500">*</span>
        </label>
        <Spin spinning={loading}>
          <Select
            value={telesale}
            onChange={(val) => setTelesale(val as number)}
            placeholder="-- Chọn Telesale --"
            className="!w-full !h-11 !rounded-lg"
            showSearch
            options={telesaleOptions}
          />
        </Spin>
      </div>

      {/* Ghi chú */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700 text-sm">
          Ghi chú <span className="text-red-500">*</span>
        </label>
        <TextArea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (e.target.value.trim()) setNoteError("");
          }}
          placeholder="Ghi chú về việc gán khách hàng..."
          rows={4}
          status={noteError ? "error" : undefined}
          className="!rounded-lg"
        />
        {noteError && (
          <div className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {noteError}
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          onClick={handleCancel}
          className="!h-10 !px-5 !rounded-lg"
        >
          Hủy
        </Button>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleOk}
          disabled={typeof telesale !== "number" || loading}
          className="!bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-blue-700 !h-10 !px-6 !rounded-lg !font-medium !shadow-md hover:!shadow-lg !transition-all"
        >
          Gán khách hàng
        </Button>
      </div>
    </Modal>
  );
};

export default AssignTelesaleModal;
