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
      width={480}
      closable={true}
      closeIcon={
        <span className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      }
      title={
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <UserAddOutlined className="text-white text-lg" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base m-0">Gán khách hàng</h3>
            <p className="text-xs text-gray-500 m-0 mt-0.5">Chọn nhân viên telesale để gán</p>
          </div>
        </div>
      }
    >
      <div className="pt-4">
        {/* Chọn telesale */}
        <div className="mb-4">
          <label className="block mb-1.5 font-medium text-gray-700 text-sm">
            Telesale <span className="text-red-500">*</span>
          </label>
          <Spin spinning={loading}>
            <Select
              value={telesale}
              onChange={(val) => setTelesale(val as number)}
              placeholder="Chọn nhân viên telesale"
              className="!w-full"
              size="large"
              showSearch
              optionFilterProp="label"
              options={telesaleOptions}
            />
          </Spin>
        </div>

        {/* Ghi chú */}
        <div className="mb-5">
          <label className="block mb-1.5 font-medium text-gray-700 text-sm">
            Ghi chú <span className="text-red-500">*</span>
          </label>
          <TextArea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (e.target.value.trim()) setNoteError("");
            }}
            placeholder="Nhập ghi chú..."
            rows={3}
            status={noteError ? "error" : undefined}
            className="!resize-none"
          />
          {noteError && (
            <p className="text-red-500 text-xs mt-1.5 m-0">{noteError}</p>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button
            onClick={handleCancel}
            className="!h-9 !px-4 !text-sm"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            disabled={typeof telesale !== "number" || loading}
            className="!h-9 !px-4 !text-sm !bg-blue-500 hover:!bg-blue-600 !border-blue-500 hover:!border-blue-600 !text-white"
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignTelesaleModal;
