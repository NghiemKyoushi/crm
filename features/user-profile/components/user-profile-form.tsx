"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import {
  Card,
  Input,
  Button,
  Upload,
  Typography,
  Checkbox,
  Avatar,
  message,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUpdatePassword, useUpdateUserProfile, useUserProfile } from "../hooks/user-profile";
import { toast } from "react-toastify";

type FormValues = {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const { Title, Text } = Typography;

const schema = yup.object({
  fullName: yup.string().required("Họ và tên không được để trống"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email không được để trống"),

  currentPassword: yup.string().when("newPassword", {
    is: (val: string | undefined) => !!val?.trim(),
    then: (schema) => schema.required("Vui lòng nhập mật khẩu hiện tại"),
    otherwise: (schema) => schema.notRequired(),
  }),
  newPassword: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    // .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    // .max(20, "Mật khẩu mới không được vượt quá 20 ký tự")
    // .matches(
    //   /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
    //   "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số"
    // )
    ,
  confirmPassword: yup.string().when("newPassword", {
    is: (val: string | undefined) => !!val?.trim(),
    then: (schema) =>
      schema
        .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
        .required("Vui lòng nhập lại mật khẩu mới"),
    otherwise: (schema) => schema.notRequired(),
  }),
});




export default function UserProfileForm() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { data, isLoading } = useUserProfile();
  const { mutate: updateProfile } = useUpdateUserProfile();
  const { mutate: changePassword } = useUpdatePassword();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      fullName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // set default values khi có data
  useEffect(() => {
    if (data) {
      reset({
        fullName: data.full_name,
        email: data.email ,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [data, reset]);

  // convert file sang base64
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // xử lý upload ảnh
  const handleBeforeUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) return Upload.LIST_IGNORE;
    if (file.size / 1024 / 1024 > 2) return Upload.LIST_IGNORE;
    const preview = await getBase64(file);
    setProfileImage(preview);
    return false;
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const hasProfileChange = values.fullName || values.email;
    const hasPasswordChange = values.newPassword;
  
    try {
      // Case 1: chỉ update profile
      if (hasProfileChange && !hasPasswordChange) {
        await new Promise((resolve, reject) => {
          updateProfile(
            {
              full_name: values.fullName,
              email: values.email,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            { onSuccess: resolve, onError: reject }
          );
        });
        toast.success("Cập nhật thông tin cá nhân thành công!");
      }
  
      if (!hasProfileChange && hasPasswordChange) {
        await new Promise((resolve, reject) => {
          changePassword(
            {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
              confirmPassword: values.confirmPassword,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            { onSuccess: resolve, onError: reject }
          );
        });
        toast.success("Đổi mật khẩu thành công!");
      }
  
      // Case 3: update cả 2
      if (hasProfileChange && hasPasswordChange) {
        await Promise.all([
          new Promise((resolve, reject) => {
            updateProfile(
              {
                full_name: values.fullName,
                email: values.email,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any,
              { onSuccess: resolve, onError: reject }
            );
          }),
          new Promise((resolve, reject) => {
            changePassword(
              {
                old_password: values.currentPassword,
                new_password: values.newPassword,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any,
              { onSuccess: resolve, onError: reject }
            );
          }),
        ]);
        toast.success("Đã lưu tất cả thay đổi!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };
  

  return (
    <div className="p-6 mx-20 space-y-6">
      <Card title="" className="!rounded-none">
        <Title level={3}>Thông tin Cá nhân</Title>
        <Text className="text-gray-600">
          Quản lý thông tin, mật khẩu và quyền hạn tài khoản của bạn.
        </Text>
      </Card>

      {/* Form chính */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card title="Thông tin cơ bản" className="!rounded-none">
          <div className="flex items-start flex-col gap-6">
            <div className="flex flex-row items-center gap-2">
              <Avatar
                size={80}
                src={profileImage}
                icon={!profileImage ? <UserOutlined /> : undefined}
                className="bg-gray-200"
              />
              <div className="flex flex-col justify-center items-center">
                <Upload showUploadList={false} beforeUpload={handleBeforeUpload}>
                  <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
                </Upload>
                <p className="text-[12px] text-gray-500">
                  JPG, GIF hoặc PNG. Tối đa 2MB.
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 w-full">
              <div>
                <label className="block mb-1 font-medium">Họ và Tên</label>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Địa chỉ email</label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
            </div>
          </div>
        </div>
      </Card>

      {/* Role & Permissions */}
      <Card title="Vai trò & Quyền hạn" className="!rounded-none">
        <p className="mb-4">
          Vai trò hiện tại của bạn là:{" "}
          <span className="text-blue-600 font-semibold">
            Super Administrator
          </span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium mb-2">Quản lý Đơn hàng</p>
            <Checkbox defaultChecked disabled>
              Xem tất cả đơn hàng
            </Checkbox>
            <br />
            <Checkbox defaultChecked disabled>
              Tạo/Sửa/Hủy đơn hàng
            </Checkbox>
          </div>
          <div>
            <p className="font-medium mb-2">Quản lý Người dùng</p>
            <Checkbox defaultChecked disabled>
              Quản lý khách hàng
            </Checkbox>
            <br />
            <Checkbox defaultChecked disabled>
              Quản lý nhân viên & vai trò
            </Checkbox>
          </div>
          <div>
            <p className="font-medium mb-2">Quản lý Tài chính</p>
            <Checkbox disabled>Duyệt lệnh nạp/rút tiền</Checkbox>
            <br />
            <Checkbox disabled>Quản lý công nợ & đối soát</Checkbox>
          </div>
          <div>
            <p className="font-medium mb-2">Cài đặt hệ thống</p>
            <Checkbox disabled>Toàn quyền cài đặt</Checkbox>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card title="Đổi mật khẩu" className="!rounded-none">
          <div className="flex flex-col gap-3 w-1/3">
            <div>
              <label className="block mb-1 font-medium">Mật khẩu hiện tại</label>
              <Controller
                name="currentPassword"
                control={control}
                render={({ field }) => <Input.Password {...field} />}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Mật khẩu mới</label>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => <Input.Password {...field} />}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Xác nhận mật khẩu mới
              </label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => <Input.Password {...field} />}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="primary" htmlType="submit" className="px-6">
              Lưu tất cả thay đổi
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
