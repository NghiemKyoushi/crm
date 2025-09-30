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

  // ✅ Validation cho từng form
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

  // ✅ Form 1: Profile
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

  // ✅ Form 2: Password
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

  // ✅ Upload Avatar
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

  // ✅ Submit Profile
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

  // ✅ Submit Password
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

  return (
    <div className="p-6 mx-10 space-y-6">
      {/* <Card>
        <Title level={3}>Thông tin Cá nhân</Title>
        <Text className="text-gray-600">
          Quản lý thông tin, mật khẩu và quyền hạn tài khoản của bạn.
        </Text>
      </Card> */}

      <Tabs
        className="bg-white !p-5"
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: t('userProfile.basicInfo'),
            children: (
              <form onSubmit={handleProfileSubmit(onSubmitProfile)}>
                <Card className="!border-0 !shadow-none">
                  <div className="flex items-start flex-col gap-6">
                    <div className="flex flex-row items-center gap-2">
                      <Avatar
                        size={80}
                        src={profileImage}
                        icon={!profileImage ? <UserOutlined /> : undefined}
                        className="bg-gray-200"
                      />
                      <div className="flex flex-col justify-center items-center">
                        <Upload
                          showUploadList={false}
                          beforeUpload={handleBeforeUpload}
                        >
                          <Button icon={<UploadOutlined />}>
                            {t('userProfile.avatar.change')}
                          </Button>
                        </Upload>
                        <p className="text-[12px] text-gray-500">
                          {t('userProfile.avatar.fileFormat')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 w-full">
                      <div>
                        <label className="block mb-1 font-medium">
                          {t('userProfile.form.fullName')}
                        </label>
                        <Controller
                          name="fullName"
                          control={profileControl}
                          render={({ field }) => <Input {...field} />}
                        />
                        {profileErrors.fullName && (
                          <p className="text-red-500 text-xs mt-1">
                            {profileErrors.fullName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">
                          {t('userProfile.form.email')}
                        </label>
                        <Controller
                          name="email"
                          control={profileControl}
                          render={({ field }) => <Input {...field} disabled />}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">
                          {t('userProfile.form.phoneNumber')}
                        </label>
                        <Controller
                          name="phoneNumber"
                          control={profileControl}
                          render={({ field }) => <Input {...field} />}
                        />
                        {profileErrors.phoneNumber && (
                          <p className="text-red-500 text-xs mt-1">
                            {profileErrors.phoneNumber.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">
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
                    <div className="flex justify-end mt-4 w-full">
                      <Button type="primary" htmlType="submit" className="px-6">
                        {t('userProfile.form.saveInfo')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </form>
            ),
          },
          {
            key: "2",
            label: t('userProfile.rolesPermissions'),
            children: (
              <Card className="!border-0 !shadow-none">
                <p className="mb-4">
                  {t('userProfile.form.currentRole')}{" "}
                  <span className="text-blue-600 font-semibold">
                    {listRole && listRole.role_name}
                  </span>
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {listRole &&
                    listRole.groups.map((group) => {
                      // Map group code to i18n key
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
                        <div key={group.id}>
                          <p className="font-medium mb-2">{groupLabel}</p>
                          {group?.permissions?.map((perm) => {
                            const permissionLabel = getPermissionLabel(
                              perm.name,
                              t,
                              perm.description
                            );
                            return (
                              <div key={perm.id}>
                                <Checkbox checked={perm.active} disabled>
                                  {permissionLabel}
                                </Checkbox>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
              </Card>
            ),
          },
          {
            key: "3",
            label: t('userProfile.changePassword'),
            children: (
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
                <Card className="!border-0 !shadow-none">
                  <div className="flex flex-col gap-3 w-2/4">
                    <div>
                      <label className="block mb-1 font-medium">
                        {t('userProfile.form.currentPassword')}
                      </label>
                      <Controller
                        name="currentPassword"
                        control={passwordControl}
                        render={({ field }) => <Input.Password {...field} />}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">
                        {t('userProfile.form.newPassword')}
                      </label>
                      <Controller
                        name="newPassword"
                        control={passwordControl}
                        render={({ field }) => <Input.Password {...field} />}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">
                        {t('userProfile.form.confirmPassword')}
                      </label>
                      <Controller
                        name="confirmPassword"
                        control={passwordControl}
                        render={({ field }) => <Input.Password {...field} />}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button type="primary" htmlType="submit" className="px-6">
                      {t('userProfile.changePassword')}
                    </Button>
                  </div>
                </Card>
              </form>
            ),
          },
        ]}
      />
    </div>
  );
}
