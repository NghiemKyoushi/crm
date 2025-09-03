import { Modal, Checkbox, Button } from "antd";
import { useState } from "react";

interface User {
  email: string;
  label?: string;
}

interface AssignRoleModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (selected: string[]) => void;
  accountName: string;
  accountNumber: string;
  users: User[];
  defaultSelected?: string[];
}

export default function AssignRoleModal({
  open,
  onCancel,
  onSave,
  accountName,
  accountNumber,
  users,
  defaultSelected = [],
}: AssignRoleModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(defaultSelected);

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
        <span className="font-semibold text-blue-600">
          {accountName} – {accountNumber}
        </span>
      </p>

      {/* Scroll container */}
      <div className="max-h-60 overflow-y-auto rounded-lg p-3 space-y-2 flex flex-col gap-3 border border-zinc-400 bg-gray-100">
        {users.map((user) => (
          <Checkbox
           className="flex items-center py-2"
            key={user.email}
            checked={selectedUsers.includes(user.email)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUsers((prev) => [...prev, user.email]);
              } else {
                setSelectedUsers((prev) =>
                  prev.filter((item) => item !== user.email)
                );
              }
            }}
          >
            {user.email}{" "}
            {user.label && (
              <span className="text-gray-500">({user.label})</span>
            )}
          </Checkbox>
        ))}
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
