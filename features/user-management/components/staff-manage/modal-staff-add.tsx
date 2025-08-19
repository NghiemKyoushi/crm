import React, { useState } from "react";
import { Modal, Button, Input, Select, Radio } from "antd";
import { useForm, Controller } from "react-hook-form";

const { Option } = Select;

type EmployeeForm = {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  status: "active" | "inactive";
  role: "admin" | "sales" | "accounting" | "warehouse";

};

interface ModalStaffAddProps{
  open: boolean;
  onClose: () => void;
}
export default function ModalStaffAdd(props: ModalStaffAddProps) {
   const {onClose, open} = props;
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

  const onSubmit = (data: EmployeeForm) => {
    console.log("✅ Employee Data:", data);
    reset();
  };

  return (
    <>
      <Modal
        title={
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-semibold text-lg">Thêm Nhân viên mới</span>
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
              <label className="block mb-1 font-medium">Họ và tên *</label>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: "Vui lòng nhập họ tên" }}
                render={({ field }) => <Input {...field} />}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Email *</label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email không hợp lệ",
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
              <label className="block mb-1 font-medium">Số điện thoại</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Mật khẩu</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Để trống nếu không thay đổi"
                  />
                )}
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block mb-1 font-medium">Trạng thái</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} className="w-full">
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Đã khóa</Option>
                </Select>
              )}
            />
          </div>

          {/* Vai trò */}
          <div>
            <label className="block mb-1 font-medium">Vai trò</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} className="flex gap-6">
                  <Radio value="admin">Admin</Radio>
                  <Radio value="sales">Sales</Radio>
                  <Radio value="accounting">Kế toán</Radio>
                  <Radio value="warehouse">Nhân viên kho</Radio>
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
