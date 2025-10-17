import React, { useEffect } from "react";
import { Modal, Button, Input, Select, Radio } from "antd";
import { useForm, Controller } from "react-hook-form";
import { useListRole } from "../../hooks/staff-manage";
import { useTranslation } from "react-i18next";
import { NewUserType } from "@/types/staff-manage-type";
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
const { Option } = Select;

interface ModalStaffAddProps {
  open: boolean;
  onClose: () => void;
  handleSubmitDataUser: (data: NewUserType) => void;
  initialValues?: Partial<NewUserType>; // for edit mode
}

export default function ModalStaffAdd(props: ModalStaffAddProps) {
  const { t } = useTranslation();
  const { onClose, open, handleSubmitDataUser, initialValues } = props;

  const {
    handleSubmit,
    control,
    reset,
    // watch,
    formState: { errors },
  } = useForm<NewUserType>({
    defaultValues: {
      full_name: "",
      active:
        initialValues && initialValues.active
          ? "true"
          : initialValues && !initialValues.active
          ? "false"
          : "true",
      phone_number: "",
      role_id: 0,
      password: "",
      ...initialValues,
    },
  });

  const { data: listRole } = useListRole();

  const onSubmit = (data: NewUserType) => {
    handleSubmitDataUser(data);
    reset();
    onClose();
  };
  useEffect(() => {
    if (open) {
      const roleId: number = initialValues?.role_id
        ? Number(initialValues.role_id)
        : (listRole && listRole.length > 0 ? Number(listRole[0]?.role_id ?? 0) : 0);

      reset({
        full_name: initialValues?.full_name ?? "",
        active: initialValues?.active ?? true,
        email: initialValues?.email ?? "",
        phone_number: initialValues?.phone_number ?? "",
        role_id: roleId,
        password: initialValues?.password ?? "",
      });
    }
  }, [open, initialValues, listRole, reset]);

  return (
    <Modal
      title={
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-semibold text-lg">
            {initialValues
              ? t("staffManage.editNewStaff")
              : t("staffManage.addNewStaff")}
          </span>
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
              {t("staffManage.fullName")}*
            </label>
            <Controller
              name="full_name"
              control={control}
              rules={{ required: t("staffManage.fullNameRequired") }}
              render={({ field }) => <Input {...field} />}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">
              {t("staffManage.email")} *
            </label>
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
              render={({ field }) => (
                <Input {...field} disabled={!!initialValues} />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">
              {t("staffManage.phone")}
            </label>
            <Controller
              name="phone_number"
              control={control}
              rules={{
                required: t("staffManage.phoneNumberRequired"),
                validate: (value) =>
                  isValidPhoneGoogle(value, "VN") ||
                  t("staffManage.phoneInvalid"),
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

          {!initialValues && (
            <div>
              <label className="block mb-1 font-medium">
                {t("staffManage.password")}
              </label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: t("validation.password.required"),
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
                    message: t("form.passwordPattern"),
                  },
                }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder={t("staffManage.passwordPlaceholder")}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {t("staffManage.status")}
          </label>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <Select {...field} className="w-full">
                <Option value={true}>{t("staffManage.statusActive")}</Option>
                <Option value={false}>{t("staffManage.statusInactive")}</Option>
              </Select>
            )}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block mb-1 font-medium">
            {t("staffManage.role")}
          </label>
          <Controller
            name="role_id"
            control={control}
            render={({ field }) => (
              <Radio.Group {...field} className="flex flex-col gap-3">
                {listRole
                  ?.filter(
                    (item) =>
                      item.role_id.toString() !== "8" &&
                      item.role_name !== "USER"
                  )
                  .map((item, index) => (
                    <Radio value={item.role_id} key={index}>
                      {item.role_name}
                    </Radio>
                  ))}
              </Radio.Group>
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onClose}>{t("staffManage.cancel")}</Button>
          <Button type="primary" htmlType="submit" className="bg-blue-500">
            {t("staffManage.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
