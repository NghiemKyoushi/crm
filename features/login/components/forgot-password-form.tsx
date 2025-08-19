"use client";

import React, { useState } from "react";
import { Form, Input, Button, Modal, Space } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  useCreateNewPassword,
  useForgotPassword,
  useResendOTP,
} from "../hooks";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import logoCRM from "@/assets/login/logo_crm.jpg";
interface ForgotPasswordFormValues {
  email: string;
}
interface LoginFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = (props: LoginFormProps) => {
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const { t } = useTranslation();
  const [otpForm] = Form.useForm();

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  const forgotPassMutation = useForgotPassword();
  const createNewPasswordMutation = useCreateNewPassword();
  const resendOTPMutation = useResendOTP();

  const onFinish = (values: { email: string }) => {
    setEmailValue(values.email);
    forgotPassMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Mã OTP đã được gửi tới email!");
        setOtpModalVisible(true);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        if (err.status === 409) {
          toast.error("Hãy đợi 5 phút rồi thử lại!");
        } else {
          toast.error("Email không tồn tại!");
        }
      },
    });
  };

  const handleOtpConfirm = () => {
    otpForm.validateFields().then((values) => {
      createNewPasswordMutation.mutate(
        { email: emailValue, otp: values.otp, new_password: values.newPassword },
        {
          onSuccess: () => {
            toast.success("Xác nhận OTP thành công, mật khẩu mới đã được reset!");
            setOtpModalVisible(false);
            props.onBack();
          },
          onError: () => {
            toast.error("OTP hoặc mật khẩu không hợp lệ!");
          },
        }
      );
    });
  };

  const handleResendOtp = () => {
    resendOTPMutation.mutate(
      { email: emailValue },
      {
        onSuccess: () => {
          toast.success("OTP mới đã được gửi!");
        },
        onError: () => {
          toast.error("Hãy đợi 5 phút rồi thử lại!");
        },
      }
    );
  };

  return (
    <>
      <Form
        form={form}
        name="forgotPassword"
        onFinish={onFinish}
        layout="vertical"
        style={{
          minHeight: "500px",
          padding: "2rem",
          background: "white",
          borderRadius: "30px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex justify-center z-50">
          <Image
            src={logoCRM}
            alt="CRM Logo"
            width={150}
            height={150}
            className="!mt-[-1rem]"
          />
        </div>

        <div className="flex items-start justify-between">
          <Button
            type="link"
            onClick={props.onBack}
            className="flex items-start gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <h2 className="font-bold text-2xl mb-0 bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
            {t("login.forgotPassword")}
          </h2>
          <div className="w-8" />
        </div>

        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600 }}>Email</span>}
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder="Email"
            style={{ borderRadius: "6px" }}
          />
        </Form.Item>

        <Form.Item className="!mt-40 flex justify-center">
          <Button type="primary" htmlType="submit" size="large">
            Gửi mã xác nhận
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title={null}
        open={otpModalVisible}
        onCancel={() => setOtpModalVisible(false)}
        footer={null}
        centered
        width={360}
        className="rounded-2xl"
      >
        <Form form={otpForm} layout="vertical" onFinish={handleOtpConfirm}>
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Xác thực OTP và mật khẩu mới
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Nhập mã OTP 6 số và mật khẩu mới
            </p>

            {/* OTP */}
            <Form.Item
              name="otp"
              rules={[
                { required: true, message: "Vui lòng nhập OTP" },
                { len: 6, message: "OTP phải có đúng 6 số" },
              ]}
            >
              <Input.OTP
                length={6}
                size="large"
                className="flex justify-center gap-2 mb-4"
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: "Nhập mật khẩu mới" },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
                  message: "8-20 ký tự, gồm chữ và số",
                },
              ]}
            >
              <Input.Password
                placeholder="Mật khẩu mới"
                size="large"
                className="mt-4 mb-2.5"
              />
            </Form.Item>

            <Space direction="vertical" className="w-full mt-4">
              <Button
                type="primary"
                size="middle"
                block
                className="rounded-lg"
                htmlType="submit"
                loading={createNewPasswordMutation.isPending}
              >
                Xác nhận
              </Button>
              <Button
                type="default"
                size="middle"
                block
                className="rounded-lg"
                loading={resendOTPMutation.isPending}
                onClick={handleResendOtp}
              >
                Gửi lại OTP
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ForgotPasswordForm;
