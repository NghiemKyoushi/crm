"use client";

import React, { useCallback } from "react";
import { Form, Input } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import "./login.css";
import { useLogin } from "../hooks";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AntdButton from "@/components/ButtonComponent";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onForgot: () => void;
}

const LoginForm = ({ onForgot }: LoginFormProps) => {
  const [form] = Form.useForm<LoginFormValues>();
  const { t } = useTranslation();
  const router = useRouter();
  const loginMutation = useLogin();

  // callback submit thành công
  const onFinish = useCallback(
    (values: LoginFormValues) => {
      loginMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Đăng nhập thành công!", { position: "top-right" });
          router.push("user-management");
        },
        onError: () => {
          toast.error("Đăng nhập thất bại!", { position: "top-right" });
        },
      });
    },
    [loginMutation, router]
  );

  // callback submit lỗi validate
  const onFinishFailed = useCallback(() => {
    toast.error("Vui lòng kiểm tra lại thông tin!", {
      position: "top-right",
    });
  }, []);

  return (
    <Form
      form={form}
      name="login"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      layout="vertical"
      style={{
        padding: "2rem",
        background: "white",
        borderRadius: "30px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        border: "3px solid transparent",
        borderImageSlice: 1,
        transition: "all 0.3s ease",
      }}
    >
      <h2 className="text-center mb-6 font-bold text-2xl bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent tracking-wide">
        {t("login.signIn")}
      </h2>

      <Form.Item
        name="email"
        label={<span style={{ fontWeight: 600 }}>{t("login.email")}</span>}
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không hợp lệ!" },
        ]}
      >
        <Input
          size="large"
          prefix={<MailOutlined />}
          placeholder={t("login.email")}
          style={{ borderRadius: "6px" }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={<span style={{ fontWeight: 600 }}>{t("login.password")}</span>}
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined />}
          placeholder={t("login.password")}
          style={{ borderRadius: "6px" }}
        />
      </Form.Item>

      <Form.Item shouldUpdate={false} className="mt-6 flex justify-center">
        <AntdButton
          type="submit"
          style={{ borderRadius: "6px" }}
          loading={loginMutation.isPending}
        >
          {t("login.signIn")}
        </AntdButton>
      </Form.Item>

      <Form.Item shouldUpdate={false} className="text-center">
        <div className="cursor-pointer text-blue-500 " onClick={onForgot}>{t("login.forgotPassword")}</div>
      </Form.Item>
    </Form>
  );
};

// Chỉ re-render khi prop onForgot thay đổi
export default React.memo(LoginForm);
