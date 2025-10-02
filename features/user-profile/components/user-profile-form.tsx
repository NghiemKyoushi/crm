"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Card,
  Input,
  Button,
  Upload,
  Checkbox,
  Avatar,
  message,
  DatePicker,
  Tabs,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  uploadAvatar,
  useUpdatePassword,
  useUpdateUserProfile,
  useUserProfile,
  useUserRole,
} from "../hooks/user-profile";
import { toast } from "react-toastify";
import { VIEW_IMAGE } from "@/constants/api-type";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { getPermissionLabel } from "@/utils/permission-mapping";

type ProfileFormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  birthday: string;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface Permission {
  id: number;
  name: string;
  description: string;
  active: boolean;
  group_id: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}
export interface RoleDetail {
  role_id: number;
  role_name: string;
  description: string;
  groups: Group[];
}

export default function UserProfileForm() {
  const { t } = useTranslation();

  const profileSchema = yup.object({
    fullName: yup.string().required(t('userProfile.validation.fullNameRequired')),
    email: yup
      .string()
      .email(t('userProfile.validation.emailInvalid'))
      .required(t('userProfile.validation.emailRequired')),
    phoneNumber: yup.string().required(t('userProfile.validation.phoneRequired')),
    birthday: yup.string().required(t('userProfile.validation.birthdayRequired')),
  });

  const passwordSchema = yup.object({
    currentPassword: yup.string().required(t('userProfile.validation.currentPasswordRequired')),
    newPassword: yup
      .string()
      .min(8, t('userProfile.validation.newPasswordMinLength'))
      .max(20, t('userProfile.validation.newPasswordMaxLength'))
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
        t('userProfile.validation.newPasswordPattern')
      )
      .required(t('userProfile.validation.newPasswordRequired')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], t('userProfile.validation.confirmPasswordMatch'))
      .required(t('userProfile.validation.confirmPasswordRequired')),
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const { data } = useUserProfile();
  const { data: listRole } = useUserRole();
  const { mutate: updateProfile } = useUpdateUserProfile();
  const { mutate: changePassword } = useUpdatePassword();

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      birthday: "",
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (data) {
      resetProfile({
        fullName: data.full_name,
        email: data.email,
        phoneNumber: data.phone_number,
        birthday: data.birthday,
      });

      if (data.profile_image_id) {
        setProfileImage(
          `${process.env.NEXT_PUBLIC_ROOT_STATIC_URL}${VIEW_IMAGE}${data.profile_image_id}`
        );
      }
    }
  }, [data, resetProfile]);

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleBeforeUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) return Upload.LIST_IGNORE;

    if (file.size / 1024 / 1024 > 2) {
      message.error(t('userProfile.avatar.sizeError'));
      return Upload.LIST_IGNORE;
    }

    const preview = await getBase64(file);
    setProfileImage(preview);
    await uploadAvatar(file);
    toast.success(t('userProfile.avatar.uploadSuccess'));
  };

  const onSubmitProfile: SubmitHandler<ProfileFormValues> = async (values) => {
    try {
      updateProfile(
        {
          full_name: values.fullName,
          email: values.email,
          phone_number: values.phoneNumber,
          birthday: values.birthday,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        {
          onSuccess: () =>
            toast.success(t('userProfile.messages.updateSuccess')),
          onError: () => toast.error(t('userProfile.messages.updateFailed')),
        }
      );
    } catch {
      toast.error(t('userProfile.messages.generalError'));
    }
  };

  const onSubmitPassword: SubmitHandler<PasswordFormValues> = async (
    values
  ) => {
    changePassword(
      {
        old_password: values.currentPassword,
        new_password: values.newPassword,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {
        onSuccess: () => {
          toast.success(t('userProfile.messages.changePasswordSuccess'));
          resetPassword();
        },
        onError: () => toast.error(t('userProfile.messages.changePasswordFailed')),
      }
    );
  };

  const tabItems = [
    {
      key: "1",
      label: t('userProfile.basicInfo'),
      children: (
        <form onSubmit={handleProfileSubmit(onSubmitProfile)}>
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-lg">
              <Avatar
                size={90}
                src={profileImage}
                icon={!profileImage ? <UserOutlined /> : undefined}
                className="bg-gray-200"
              />
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-800 mb-1">{data?.full_name || t('userProfile.form.fullName')}</h3>
                <p className="text-sm text-gray-500 mb-3">{data?.email}</p>
                <Upload
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                >
                  <Button icon={<UploadOutlined />} size="small">
                    {t('userProfile.avatar.change')}
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 mt-2">
                  {t('userProfile.avatar.fileFormat')}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t('userProfile.form.fullName')}
                </label>
                <Controller
                  name="fullName"
                  control={profileControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t('userProfile.form.fullName')}
                    />
                  )}
                />
                {profileErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {profileErrors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t('userProfile.form.email')}
                </label>
                <Controller
                  name="email"
                  control={profileControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled
                    />
                  )}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t('userProfile.form.phoneNumber')}
                </label>
                <Controller
                  name="phoneNumber"
                  control={profileControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t('userProfile.form.phoneNumber')}
                    />
                  )}
                />
                {profileErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {profileErrors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t('userProfile.form.birthday')}
                </label>
                <Controller
                  name="birthday"
                  control={profileControl}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format="YYYY-MM-DD"
                      placeholder="YYYY-MM-DD"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(
                          date ? date.format("YYYY-MM-DD") : ""
                        )
                      }
                      className="w-full"
                    />
                  )}
                />
                {profileErrors.birthday && (
                  <p className="text-red-500 text-xs mt-1">
                    {profileErrors.birthday.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="primary"
                htmlType="submit"
                className="px-6"
              >
                {t('userProfile.form.saveInfo')}
              </Button>
            </div>
          </div>
        </form>
      ),
    },
    {
      key: "2",
      label: t('userProfile.rolesPermissions'),
      children: (
        <div className="space-y-6">
          {/* Role Badge */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('userProfile.form.currentRole')}</p>
            <p className="text-lg font-semibold text-gray-800">
              {listRole && listRole.role_name}
            </p>
          </div>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 gap-4">
            {listRole &&
              listRole.groups.map((group) => {
                const groupI18nKeyMap: Record<string, string> = {
                  'ORDER_MANAGEMENT': 'orderManagement',
                  'USER_MANAGEMENT': 'userManagement',
                  'FINANCE_MANAGEMENT': 'financeManagement',
                  'TELESALES': 'telesales',
                  'SALES_MANAGEMENT': 'sales',
                };

                const groupI18nKey = groupI18nKeyMap[group.name];
                const groupLabel = groupI18nKey
                  ? t(`permissions.groups.${groupI18nKey}`)
                  : group.description || t('common.uncategorized');

                return (
                  <div key={group.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-100">
                      {groupLabel}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {group?.permissions?.map((perm) => {
                        const permissionLabel = getPermissionLabel(
                          perm.name,
                          t,
                          perm.description
                        );
                        return (
                          <div key={perm.id}>
                            <Checkbox checked={perm.active} disabled className="text-sm">
                              {permissionLabel}
                            </Checkbox>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: t('userProfile.changePassword'),
      children: (
        <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
          <div className="space-y-6 max-w-2xl">
            {/* Security Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700">
                Mật khẩu phải từ 8-20 ký tự, bao gồm chữ và số
              </p>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t('userProfile.form.currentPassword')}
                </label>
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="••••••••"
                    />
                  )}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t('userProfile.form.newPassword')}
                </label>
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="••••••••"
                    />
                  )}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t('userProfile.form.confirmPassword')}
                </label>
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="••••••••"
                    />
                  )}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="primary"
                htmlType="submit"
                className="px-6"
              >
                {t('userProfile.changePassword')}
              </Button>
            </div>
          </div>
        </form>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin, mật khẩu và quyền hạn tài khoản của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs
            defaultActiveKey="1"
            items={tabItems}
          />
        </div>
      </div>
    </div>
  );
}
