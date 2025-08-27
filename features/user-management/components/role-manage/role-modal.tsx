"use client";

import { Modal, Checkbox, Form, Input, Spin } from "antd";
import { Controller, useForm } from "react-hook-form";
import { getListPermiss } from "../../apis/staff-manage";
import { useEffect, useState } from "react";

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormValues) => Promise<void> | void;
}

export interface RoleFormValues {
  name: string;
  description: string;
  permissions: string[];
}

// Map group_name sang tiếng Việt
const CATEGORY_LABELS: Record<string, string> = {
  ORDER_MANAGEMENT: "Quản lý Đơn hàng",
  FINANCIAL_MANAGEMENT: "Quản lý Tài chính",
  FINANCE: "Quản lý Tài chính",
  USER_MANAGEMENT: "Quản lý Người dùng",
  SYSTEM_ADMIN: "Cài đặt Hệ thống",
  SYSTEM_SETTINGS: "Cài đặt Hệ thống",
};

export function renderCategoryName(code: string) {
  return CATEGORY_LABELS[code] || code || "Chưa phân loại";
}

// Map data từ API sang format cho Checkbox.Group
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPermissionsFromApi(apiData: any[]) {
  if (!Array.isArray(apiData)) return [];

  return apiData.map((group) => ({
    id: group.group_id,
    category: renderCategoryName(group.group_name),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permissions: (group.permissions || []).map((p: any) => ({
      label: p.description || p.permission || "Không rõ",
      value: p.permission?.toString() || "",
    })),
  }));
}

export const RoleModal: React.FC<RoleModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { control, handleSubmit, reset } = useForm<RoleFormValues>({
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState<
    {
      id: number;
      category: string;
      permissions: { label: string; value: string }[];
    }[]
  >([]);

  // Fetch permissions khi mở modal
  useEffect(() => {
    if (!open) return;

    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const res = await getListPermiss(); // API trả về [{ group_id, group_name, permissions: [] }]
        setGrouped(mapPermissionsFromApi(res));
      } catch (error) {
        console.error("Fetch permissions error:", error);
        setGrouped([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();

    // reset form mỗi lần mở modal
    reset({
      name: "",
      description: "",
      permissions: [],
    });
  }, [open, reset]);

  const handleOk = async (data: RoleFormValues) => {
    try {
      await onSubmit(data); // hỗ trợ async submit
      reset();
      onClose();
    } catch (error) {
      console.error("Submit role error:", error);
    }
  };

  return (
    <Modal
      title="Thêm Vai trò mới"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(handleOk)}
      okText="Thêm Vai trò"
      cancelText="Hủy"
      destroyOnClose
      width={500}
    >
      <Form layout="vertical" className="">
        {/* Tên vai trò */}
        <Form.Item label="Tên Vai trò" required className="!mb-0.5">
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

        <Form.Item label="Mô tả" required className="!mb-0.5">
          <Controller
            name="description"
            control={control}
            rules={{ required: "Mô tả là bắt buộc" }}
            render={({ field, fieldState }) => (
              <>
                <Input placeholder="VD: Vai trò cho quản lý kho" {...field} />
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
                  <div className="flex justify-center py-4">
                    <Spin />
                  </div>
                ) : grouped.length > 0 ? (
                  grouped.map((group) => (
                    <div key={group.id} className="!mb-0.5 p-1 rounded-md">
                      <h4 className="font-medium ">{group.category}</h4>
                      <Checkbox.Group
                        options={group.permissions}
                        value={field.value?.filter((v) =>
                          group.permissions.some((p) => p.value === v)
                        )} // chỉ giữ những quyền thuộc group này
                        onChange={(checkedValues) => {
                          // bỏ hết quyền của group hiện tại ra khỏi field.value
                          const otherValues =
                            field.value?.filter(
                              (v) =>
                                !group.permissions.some((p) => p.value === v)
                            ) || [];

                          // thêm lại các quyền vừa tick ở group này
                          field.onChange([...otherValues, ...checkedValues]);
                        }}
                        className="flex flex-col gap-2"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Không có quyền nào để hiển thị
                  </p>
                )}
              </div>
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
