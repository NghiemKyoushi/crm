"use client";

import React, { useCallback, useState } from "react";
import { Form, Input, Spin } from "antd";
import { MailOutlined, LockOutlined, LoadingOutlined } from "@ant-design/icons";
import "./login.css";
import { useLogin } from "../hooks";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AntdButton from "@/components/ButtonComponent";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";
import logoCRM from "@/assets/login/logo_crm.jpg";
import Cookies from "js-cookie";

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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onFinish = useCallback(
    (values: LoginFormValues) => {
      loginMutation.mutate(values, {
        onSuccess: (dataLogin) => {
          if(dataLogin.roleUser){
            toast.warning("Bạn không có quyền truy cập hệ thống", { position: "top-right" });
            return
          }
          // Show full-screen loading before redirect
          setIsRedirecting(true);

          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get("redirect") || "/dashboard";
          const decodedUrl = decodeURIComponent(redirectUrl);

          if (decodedUrl === "/login") {
            router.replace("/dashboard");
          } else {
            router.replace(decodedUrl);
          }
        },
        onError: () => {
          toast.error(t("login.failed"), { position: "top-right" });
        },
      });
    },
    [loginMutation, router, t]
  );

  // callback submit lỗi validate
  const onFinishFailed = useCallback(() => {
    toast.error(t('login.pleaseCheckInformation'), {
      position: "top-right",
    });
  }, []);

  // Show full-screen loading overlay when redirecting
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#0ea5e9' }} spin />}
        />
        <p className="mt-6 text-lg text-gray-600 font-medium">
          {t("login.redirecting")}
        </p>
      </div>
    );
  }

  return (
    <Form
        form={form}
        name="login"
        autoComplete="off"
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
      <div className="flex justify-center z-50">
        <Image
          src={logoCRM}
          alt="CRM Logo"
          width={150}
          height={150}
          className="!mt-[1-rem]"
        />
      </div>
      <h2 className="text-center mb-6 font-bold text-2xl bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent tracking-wide">
        {t("login.signIn")}
      </h2>

      <Form.Item
        name="email"
        label={<span style={{ fontWeight: 600 }}>{t("login.email")}</span>}
        rules={[
          { required: true, message: t("validation.email.required") },
          { type: "email", message: t("validation.email.invalid") },
        ]}
      >
        <Input
          size="large"
          autoComplete="username"
          prefix={<MailOutlined />}
          placeholder={t("login.email")}
          style={{ borderRadius: "6px" }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        preserve
        label={<span style={{ fontWeight: 600 }}>{t("login.password")}</span>}
        rules={[{ required: true, message: t("validation.password.required") }]}
        shouldUpdate={false}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined />}
          autoComplete="new-password"
          placeholder={t("login.password")}
          style={{ borderRadius: "6px" }}
        />
      </Form.Item>

      <Form.Item className="mt-6 flex justify-center">
        <AntdButton
          type="submit"
          style={{ borderRadius: "6px" }}
          loading={loginMutation.isPending}
        >
          {t("login.signIn")}
        </AntdButton>
      </Form.Item>
      <div className="flex flex-row justify-center items-center text-center gap-2">
        <div className="cursor-pointer text-blue-500" onClick={onForgot}>
          {t("login.forgotPassword")}
        </div>
        <div className="flex flex-row justify-center items-center text-center">
          <LanguageSwitcher />
        </div>
      </div>
    </Form>
  );
};

// Chỉ re-render khi prop onForgot thay đổi
export default React.memo(LoginForm);
