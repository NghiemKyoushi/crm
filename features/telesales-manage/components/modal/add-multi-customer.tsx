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
      title="Xác nhận gán Sale cho các Khách Hàng đã chọn"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
    >
      {customers.length === 0 ? (
        <div>Bạn chưa chọn khách hàng nào để gán sale.</div>
      ) : (
        <div className="space-y-2 mb-4">
          <div className="font-semibold">Danh sách khách hàng đã chọn:</div>
          <ul className="list-disc ml-4">
            {customers.map((cust) => (
              <li key={cust.id}>
                {cust.name} - SĐT: {(cust.phone || "").split("\n")[0]}
              </li>
            ))}
          </ul>
          {/* Field chọn sale */}
          <div className="mt-4">
            <div className="font-semibold mb-1">Chọn Sale để gán</div>
            <Select
              placeholder="Chọn Sale"
              className="w-full !h-11"
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
                    {/* Tùy vào structure, ưu tiên fullname nếu có */}
                    {user.fullname
                      ? `${user.fullname} (${user.phonenumber}) - ${
                          user.email || ""
                        }`
                      : user.name || user.email || user.id}
                  </Option>
                ))
              )}
            </Select>
          </div>
          {/* Thêm ô input ghi chú */}
          <div className="mt-4">
            <div className="font-semibold mb-1">Ghi chú</div>
            <Input.TextArea
              placeholder="Nhập ghi chú cho lần gán sale này (tuỳ chọn)..."
              rows={3}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Nút xác nhận mở modal gán sale thực sự */}
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Hủy</Button>
        <Button
          type="primary"
          disabled={customers.length === 0 || !saleId}
          onClick={() => {
            if (saleId) onConfirm(saleId);
          }}
        >
          Xác nhận &amp; Gán Sale
        </Button>
      </div>
    </Modal>
  );
};

export default AddMultiCustomerModal;
