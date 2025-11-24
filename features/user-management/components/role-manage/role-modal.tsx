"use client";

import { Modal, Checkbox, Form, Input, Spin } from "antd";
import { Controller, useForm } from "react-hook-form";
import { getListPermiss } from "../../apis/staff-manage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPermissionLabel } from "@/utils/permission-mapping";

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

// Map group_name to i18n keys
const CATEGORY_I18N_KEYS: Record<string, string> = {
  ORDER_MANAGEMENT: "orders",
  FINANCIAL_MANAGEMENT: "finance",
  FINANCE: "finance",
  USER_MANAGEMENT: "users",
  SYSTEM_ADMIN: "system",
  SYSTEM_SETTINGS: "system",
  TELESALES: "telesales",
  SALES_MANAGEMENT: "sales",
  WAREHOUSE_MANAGEMENT:"stockManager",
  MATERIAL_MANAGEMENT:"material"
};

export function renderCategoryName(code: string, t: (key: string) => string) {
  const i18nKey = CATEGORY_I18N_KEYS[code];
  if (i18nKey) {
    return t(`permissions.groups.${i18nKey}`);
  }
  return code || t('common.uncategorized');
}


// Map data từ API sang format cho Checkbox.Group
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPermissionsFromApi(apiData: any[], t: (key: string) => string) {
  if (!Array.isArray(apiData)) return [];

  return apiData.map((group) => ({
    id: group.group_id,
    category: renderCategoryName(group.group_name, t),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permissions: (group.permissions || []).map((p: any) => {
      const permissionName = p.permission || p.name;
      const label = getPermissionLabel(permissionName, t, p.description);

      return {
        label,
        value: permissionName,
      };
    }),
  }));
}

export const RoleModal: React.FC<RoleModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
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
        setGrouped(mapPermissionsFromApi(res, t));
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
      title={t('roles.modal.addTitle')}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(handleOk)}
      okText={t('roles.modal.addButton')}
      cancelText={t('common.cancel')}
      destroyOnClose
      width={500}
      centered
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      <Form layout="vertical" className="">
        {/* Tên vai trò */}
        <Form.Item label={t('roles.form.name')} required className="!mb-0.5">
          <Controller
            name="name"
            control={control}
            rules={{ required: t('roles.form.nameRequired') }}
            render={({ field, fieldState }) => (
              <>
                <Input placeholder={t('roles.form.namePlaceholder')} {...field} />
                {fieldState.error && (
                  <span className="text-red-500 text-sm">
                    {fieldState.error.message}
                  </span>
                )}
              </>
            )}
          />
        </Form.Item>

        <Form.Item label={t('roles.form.description')} required className="!mb-0.5">
          <Controller
            name="description"
            control={control}
            rules={{ required: t('roles.form.descriptionRequired') }}
            render={({ field, fieldState }) => (
              <>
                <Input placeholder={t('roles.form.descriptionPlaceholder')} {...field} />
                {fieldState.error && (
                  <span className="text-red-500 text-sm">
                    {fieldState.error.message}
                  </span>
                )}
              </>
            )}
          />
        </Form.Item>
        <Form.Item label={t('roles.form.permissions')}>
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
                    {t('roles.form.noPermissions')}
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
