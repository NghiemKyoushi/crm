import { getListBankPermission } from "@/features/finance-manage/apis";
import { Modal, Checkbox, Button, Spin } from "antd";
import { useState, useEffect } from "react";

interface AssignRoleModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (selected: number[]) => void;
  accountName: string;
  accountNumber: string;
  defaultSelected?: number[];
  idBank: string;
}

export interface AdminUserCheck {
  email: string;
  is_checked: boolean;
  admin_user_id: number;
}

export default function AssignRoleModal({
  open,
  onCancel,
  onSave,
  accountName,
  accountNumber,
  defaultSelected = [],
  idBank,
}: AssignRoleModalProps) {
    
  const [selectedUsers, setSelectedUsers] = useState<number[]>(defaultSelected);
  const [staffs, setStaffs] = useState<AdminUserCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStaffs = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getListBankPermission(+idBank);
      setStaffs(response);
      const preSelected = response
        .filter((user: AdminUserCheck) => user.is_checked)
        .map((user: AdminUserCheck) => user.admin_user_id);

      setSelectedUsers(preSelected);
    } catch (err) {
      console.error("Fetch staffs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStaffs();
    } else {
      setStaffs([]);
    }
  }, [open]);

  const handleOk = () => {
    onSave(selectedUsers);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      className="rounded-xl"
      title={<h2 className="text-lg font-semibold">Phân quyền Quản lý</h2>}
    >
      <p className="text-gray-600 mb-4">
        Chọn các Admin được phép quản lý tài chính cho tài khoản{" "}
        <p className="font-semibold text-blue-600">
          {accountName} – {accountNumber}
        </p>
      </p>

      {/* Scroll container */}
      <div className="max-h-60 overflow-y-auto rounded-lg p-3 space-y-2 flex flex-col gap-3 border border-zinc-400 bg-gray-100">
        {staffs.map((user) => {
          return (
            <Checkbox
              className="flex items-center py-2"
              key={user.email}
              checked={selectedUsers.includes(user.admin_user_id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedUsers((prev) => [...prev, user.admin_user_id]);
                } else {
                  setSelectedUsers((prev) =>
                    prev.filter((id) => id !== user.admin_user_id)
                  );
                }   
              }}
            >
              {user.email}
            </Checkbox>
          );
        })}

        {loading && (
          <div className="flex justify-center py-2">
            <Spin />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onCancel} className="bg-gray-100">
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={handleOk}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Lưu thay đổi
        </Button>
      </div>
    </Modal>
  );
}
