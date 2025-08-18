"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  Input,
  Button,
  Upload,
  Typography,
  Divider,
  Checkbox,
  Avatar,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

type FormValues = {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const { Title, Text } = Typography;

export default function UserProfileForm() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Hàm convert file sang base64
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Hàm xử lý upload ảnh
  const handleBeforeUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      // message.error("Chỉ được chọn file ảnh JPG/PNG/GIF!");
      return Upload.LIST_IGNORE;
    }

    if (file.size / 1024 / 1024 > 2) {
      // message.error("Ảnh không được lớn hơn 2MB!");
      return Upload.LIST_IGNORE;
    }

    const preview = await getBase64(file);
    setProfileImage(preview);

    return false; // chặn upload lên server (chỉ preview)
  };
  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      fullName: "Admin",
      email: "admin@yourcompany.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form data: ", data);
  };

  return (
    <div className="p-6 mx-56 space-y-6 ">
      <Card title="" className="!rounded-none">
        <Title level={3}>Thông tin Cá nhân</Title>
        <Text className="text-gray-600">
          Quản lý thông tin, mật khẩu và quyền hạn tài khoản của bạn.
        </Text>
      </Card>
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
            <div className="flex flex-col justify-center items-center" >
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
            </div>
            <div>
              <label className="block mb-1 font-medium">Địa chỉ email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input {...field} disabled />}
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-1 w-1/3"
        >
          <div>
            <label className="block mb-1 font-medium">Mật khẩu hiện tại</label>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => <Input.Password {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mật khẩu mới</label>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => <Input.Password {...field} />}
            />
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
          </div>
          
        </form>
        <div className="col-span-2 flex justify-end">
            <Button type="primary" htmlType="submit" className="px-6">
              Lưu tất cả thay đổi
            </Button>
          </div>
      </Card>
    </div>
  );
}
