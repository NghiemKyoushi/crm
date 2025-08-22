"use client";

import { Modal, Checkbox, Form, Input, Spin } from "antd";
import { Controller, useForm } from "react-hook-form";
import { getListPermiss, groupPermissions, renderCategoryName } from "../../apis/staff-manage";
import { useEffect, useState } from "react";

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormValues) => void;
}

export interface RoleFormValues {
  name: string;
  permissions: string[];
}

export const permissionsGrouped = [
  {
    group: "Quản lý Đơn hàng",
    items: [
      { label: "Xem tất cả đơn hàng", value: "order:view" },
      { label: "Tạo/Sửa/Hủy đơn hàng", value: "order:manage" },
    ],
  },
  {
    group: "Quản lý Tài chính",
    items: [
      { label: "Duyệt lệnh nạp/rút tiền", value: "finance:approve" },
      { label: "Quản lý công nợ & đối soát", value: "finance:debt" },
      { label: "Quản lý tài khoản ngân hàng công ty", value: "finance:bank" },
    ],
  },
  {
    group: "Quản lý Người dùng",
    items: [
      { label: "Quản lý khách hàng & phân loại", value: "user:customer" },
      { label: "Quản lý nhân viên & vai trò", value: "user:staff" },
    ],
  },
  {
    group: "Cài đặt Hệ thống",
    items: [{ label: "Toàn quyền truy cập cài đặt", value: "system:full" }],
  },
];

export const RoleModal: React.FC<RoleModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
   const { control, handleSubmit, reset } = useForm<RoleFormValues>({
    defaultValues: {
      name: "",
      permissions: [],
    },
  });
 const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState<
    { category: string; permissions: { label: string; value: string }[] }[]
  >([]);

  // Fetch permissions on open
  useEffect(() => {
    if (!open) return;
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const res = await getListPermiss(); // ← [{ permission, description, category, ... }]
        const groupedData = groupPermissions(res).map((g) => ({
          category: renderCategoryName(g.category),
          permissions: g.permissions.map((p) => ({
            label: p.description,
            value: p.permission,
          })),
        }));        
        setGrouped(groupedData);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [open]);

  const handleOk = (data: RoleFormValues) => {
    console.log('data');
    
    onSubmit(data);
    reset();
    onClose();
  };
  return (
   <Modal
      title="Thêm Vai trò mới"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(handleOk)}
      okText="Thêm Vai trò"
      cancelText="Hủy"
    >
      <Form layout="vertical" className="space-y-4">
        <Form.Item label="Tên Vai trò">
          <Controller
            name="name"
            control={control}
            rules={{ required: "Tên vai trò là bắt buộc" }}
            render={({ field, fieldState }) => (
              <>
                <Input placeholder="VD: Quản lý Kho" {...field} />
                {fieldState.error && (
                  <span className="text-red-500 text-sm">
                    {fieldState.error.message}
                  </span>
                )}
              </>
            )}
          />
        </Form.Item>

        <Form.Item label="Quyền hạn">
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                {loading ? (
                  <Spin />
                ) : (
                  grouped.map((group, index) => (
                    <div key={index}>
                      <h4 className="font-medium mb-2">{group.category}</h4>
                      <Checkbox.Group
                        options={group.permissions}
                        value={field.value}
                        onChange={field.onChange}
                        className="flex flex-col gap-2"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          />
        </Form.Item>
      </Form>
     
    </Modal>
  );
};
