import React, { useEffect } from "react";
import { Modal, Button, Input } from "antd";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CreateCustomerParams } from "../../apis/staff-manage";
import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export function isValidPhoneGoogle(phone: string, region: string = "VN") {
  try {
    const number = phoneUtil.parseAndKeepRawInput(phone, region);
    return phoneUtil.isValidNumberForRegion(number, region);
  } catch (error) {
    return false;
  }
}

interface ModalCreateCustomerProps {
  open: boolean;
  onClose: () => void;
  handleSubmitData: (data: CreateCustomerParams) => void;
}

export default function ModalCreateCustomer(props: ModalCreateCustomerProps) {
  const { t } = useTranslation();
  const { onClose, open, handleSubmitData } = props;

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerParams>({
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      password: "",
    },
  });

  const onSubmit = (data: CreateCustomerParams) => {
    handleSubmitData(data);
    reset();
    onClose();
  };

  useEffect(() => {
    if (open) {
      reset({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
      });
    }
  }, [open, reset]);

  return (
    <Modal
      title={
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-semibold text-lg">Tạo tài khoản</span>
        </div>
      }
      open={open}
      footer={null}
      width={700}
      onCancel={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Controller
              name="full_name"
              control={control}
              rules={{ required: "Vui lòng nhập họ và tên" }}
              render={({ field }) => <Input {...field} />}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Email <span className="text-red-500">*</span>
            </label>
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
              render={({ field }) => <Input {...field} type="email" />}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <Controller
              name="phone_number"
              control={control}
              rules={{
                required: "Vui lòng nhập số điện thoại",
                validate: (value) =>
                  isValidPhoneGoogle(value, "VN") || "Số điện thoại không hợp lệ",
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="tel"
                  inputMode="numeric"
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    field.onChange(onlyNums);
                  }}
                />
              )}
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <Controller
              name="password"
              control={control}
              rules={{
                required: "Vui lòng nhập mật khẩu",
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
                  message: "Mật khẩu phải có 8-20 ký tự, bao gồm chữ và số",
                },
              }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Nhập mật khẩu"
                />
              )}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" className="bg-blue-500">
            Tạo tài khoản
          </Button>
        </div>
      </form>
    </Modal>
  );
}

