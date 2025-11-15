import React, { useState } from "react";
import { Modal, Button, Input, Select, Spin } from "antd";
import { TelesaleCustomer } from "../../types/telesales-mng";
import { useTelesaleUsers } from "../../hooks/telesale-mng";

const { Option } = Select;

type AddMultiCustomerModalProps = {
  isOpen: boolean;
  customers: TelesaleCustomer[];
  note: string;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onConfirm: (saleId: number) => void; // now passes saleId
};

const AddMultiCustomerModal: React.FC<AddMultiCustomerModalProps> = ({
  isOpen,
  customers,
  note,
  onNoteChange,
  onClose,
  onConfirm,
}) => {
  const [saleId, setSaleId] = useState<number | undefined>(undefined);

  // Lấy danh sách telesale (sales) từ hook
  const { data: telesaleUsers, isLoading: telesaleUsersLoading } =
    useTelesaleUsers();

  // Reset saleId when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSaleId(undefined);
    }
  }, [isOpen]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-800">Gán Sale hàng loạt</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={650}
    >
      {customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="font-medium">Bạn chưa chọn khách hàng nào để gán sale.</p>
        </div>
      ) : (
        <div className="space-y-5 pt-3">
          {/* Customer list section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold text-gray-800">
                Danh sách khách hàng đã chọn ({customers.length})
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto bg-white rounded-lg p-3 border border-blue-100">
              <ul className="space-y-2">
                {customers.map((cust, idx) => (
                  <li key={cust.id} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-700">{cust.name}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-gray-600">SĐT: {(cust.phone || "").split("\n")[0]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Field chọn sale */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Chọn Sale để gán <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="-- Chọn Sale --"
              className="w-full !h-11 !rounded-lg"
              value={saleId}
              onChange={setSaleId}
              allowClear
              loading={telesaleUsersLoading}
              showSearch
              optionFilterProp="children"
            >
              {telesaleUsersLoading ? (
                <Option key="loading" value="" disabled>
                  <Spin size="small" /> Đang tải danh sách sale...
                </Option>
              ) : (
                Array.isArray(telesaleUsers) &&
                telesaleUsers.map((user: any) => (
                  <Option value={user.id} key={user.id}>
                    {user.fullname
                      ? `${user.fullname} (${user.phonenumber}) - ${user.email || ""}`
                      : user.name || user.email || user.id}
                  </Option>
                ))
              )}
            </Select>
          </div>

          {/* Thêm ô input ghi chú */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Ghi chú <span className="text-gray-400 text-xs font-normal">(Tùy chọn)</span>
            </label>
            <Input.TextArea
              placeholder="Nhập ghi chú cho lần gán sale này..."
              rows={4}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="!rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Nút xác nhận mở modal gán sale thực sự */}
      <div className="flex justify-end gap-3 pt-5 mt-2 border-t">
        <Button
          onClick={onClose}
          className="!h-10 !px-5 !rounded-lg"
        >
          Hủy
        </Button>
        <Button
          type="primary"
          disabled={customers.length === 0 || !saleId}
          onClick={() => {
            if (saleId) onConfirm(saleId);
          }}
          className="!bg-gradient-to-r !from-purple-500 !to-purple-600 hover:!from-purple-600 hover:!to-purple-700 !h-10 !px-6 !rounded-lg !font-medium !shadow-md hover:!shadow-lg !transition-all disabled:!opacity-50"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        >
          Xác nhận &amp; Gán Sale
        </Button>
      </div>
    </Modal>
  );
};

export default AddMultiCustomerModal;
