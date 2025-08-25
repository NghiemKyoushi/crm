"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Card,
  Input,
  Button,
  Upload,
  Typography,
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
} from "../hooks/user-profile";
import { toast } from "react-toastify";
import { VIEW_IMAGE } from "@/constants/api-type";
import dayjs from "dayjs";

const { Title, Text } = Typography;

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

// ✅ Validation cho từng form
const profileSchema = yup.object({
  fullName: yup.string().required("Họ và tên không được để trống"),
  email: yup.string().email("Email không hợp lệ").required("Email không được để trống"),
  phoneNumber: yup.string().required("Số điện thoại không được để trống"),
  birthday: yup.string().required("Nhập ngày sinh"),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
  newPassword: yup
    .string()
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    .max(20, "Mật khẩu mới không được vượt quá 20 ký tự")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
    .required("Vui lòng nhập lại mật khẩu mới"),
});

export default function UserProfileForm() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const { data } = useUserProfile();
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
      message.error("Ảnh phải nhỏ hơn 2MB");
      return Upload.LIST_IGNORE;
    }

    const preview = await getBase64(file);
    setProfileImage(preview);
    setProfileFile(file);
    return false;
  };

  // ✅ Submit Profile
  const onSubmitProfile: SubmitHandler<ProfileFormValues> = async (values) => {
    try {
      if (profileFile) {
        await uploadAvatar(profileFile);
        toast.success("Upload avatar thành công");
      }
      updateProfile(
        {
          full_name: values.fullName,
          email: values.email,
          phone_number: values.phoneNumber,
          birthday: values.birthday,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        {
          onSuccess: () => toast.success("Cập nhật thông tin cá nhân thành công!"),
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  // ✅ Submit Password
  const onSubmitPassword: SubmitHandler<PasswordFormValues> = async (values) => {
    changePassword(
      {
        old_password: values.currentPassword,
        new_password: values.newPassword,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {
        onSuccess: () => {
          toast.success("Đổi mật khẩu thành công!");
          resetPassword();
        },
        onError: () => toast.error("Đổi mật khẩu thất bại"),
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
        className="bg-white"
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Thông tin cơ bản",
            children: (
              <form onSubmit={handleProfileSubmit(onSubmitProfile)}>
                <Card>
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
                        <p className="text-[12px] text-gray-500">JPG, GIF hoặc PNG. Tối đa 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 w-full">
                      <div>
                        <label className="block mb-1 font-medium">Họ và Tên</label>
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
                        <label className="block mb-1 font-medium">Địa chỉ email</label>
                        <Controller
                          name="email"
                          control={profileControl}
                          render={({ field }) => <Input {...field} disabled />}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Số điện thoại</label>
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
                        <label className="block mb-1 font-medium">Ngày sinh</label>
                        <Controller
                          name="birthday"
                          control={profileControl}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              format="YYYY-MM-DD"
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(date) =>
                                field.onChange(date ? date.format("YYYY-MM-DD") : "")
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
                    <div className="flex justify-end mt-4">
                      <Button type="primary" htmlType="submit" className="px-6">
                        Lưu thông tin
                      </Button>
                    </div>
                  </div>
                </Card>
              </form>
            ),
          },
          {
            key: "2",
            label: "Vai trò & Quyền hạn",
            children: (
              <Card>
                <p className="mb-4">
                  Vai trò hiện tại của bạn là:{" "}
                  <span className="text-blue-600 font-semibold">Super Administrator</span>
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
            ),
          },
          {
            key: "3",
            label: "Đổi mật khẩu",
            children: (
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
                <Card>
                  <div className="flex flex-col gap-3 w-1/3">
                    <div>
                      <label className="block mb-1 font-medium">Mật khẩu hiện tại</label>
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
                      <label className="block mb-1 font-medium">Mật khẩu mới</label>
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
                      <label className="block mb-1 font-medium">Xác nhận mật khẩu mới</label>
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
                      Đổi mật khẩu
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
