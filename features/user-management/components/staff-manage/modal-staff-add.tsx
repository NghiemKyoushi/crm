import React, { useState } from "react";
import { Modal, Button, Input, Select, Radio } from "antd";
import { useForm, Controller } from "react-hook-form";
import { useCreateNewStaff } from "../../hooks/staff-manage";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const { Option } = Select;

type EmployeeForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  status: "active" | "inactive";
  role: "admin" | "sales" | "accounting" | "warehouse";
};

interface ModalStaffAddProps {
  open: boolean;
  onClose: () => void;
}
export default function ModalStaffAdd(props: ModalStaffAddProps) {
  const { t } = useTranslation();
  const { onClose, open } = props;
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EmployeeForm>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
      role: "sales",
    },
  });

  const createNewStaffMutation = useCreateNewStaff();

  const onSubmit = (data: EmployeeForm) => {
    const { email, fullName, phone, role, status, password } = data;
    createNewStaffMutation.mutate(
      {
        email,
        full_name: fullName,
        active: status === "active" ? true : false,
        phone_number: phone,
        role_id: role,
        password,
      },
      {
        onSuccess: () => {
          toast.success("Tạo nhân viên mới thành công!");
        },
        onError: () => {
          toast.error("Tạo nhân viên mới thất bại");
        },
      }
    );
    reset();
  };

  return (
    <>
      <Modal
        title={
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="font-semibold text-lg">{t("staffManage.addNewStaff")}</span>
          </div>
        }
        open={open}
        footer={null}
        width={700}
        onCancel={onClose}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Họ tên + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">{t("staffManage.fullName")}*</label>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: t("staffManage.fullNameRequired") }}
                render={({ field }) => <Input {...field} />}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("staffManage.email")} *</label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: t("staffManage.emailRequired"),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t("staffManage.emailInvalid"),
                  },
                }}
                render={({ field }) => <Input {...field} />}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Số điện thoại + Mật khẩu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">{t("staffManage.phone")}</label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: 'bawts buoocj nhaapj',
                }}
                render={({ field }) => <Input {...field} />}
              />
               {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("staffManage.password")}</label>
              <Controller
                name="password"
                control={control}
                 rules={{
                  required: 'bawts buoocj nhaapj',
                }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder={t("staffManage.passwordPlaceholder")}
                  />
                )}
              />
               {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block mb-1 font-medium">{t("staffManage.status")}</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} className="w-full">
                  <Option value="active">{t("staffManage.statusActive")}</Option>
                  <Option value="inactive">{t("staffManage.statusInactive")}</Option>
                </Select>
              )}
            />
          </div>

          {/* Vai trò */}
          <div>
            <label className="block mb-1 font-medium">{t("staffManage.role")}</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} className="flex gap-6">
                  <Radio value="admin">{t("staffManage.roleAdmin")}</Radio>
                  <Radio value="sales">{t("staffManage.roleSales")}</Radio>
                  <Radio value="accounting">{t("staffManage.roleAccounting")}</Radio>
                  <Radio value="warehouse">{t("staffManage.roleWarehouse")}</Radio>
                </Radio.Group>
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => onClose()}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-500">
              Lưu
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
