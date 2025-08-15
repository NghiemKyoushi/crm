import React from "react";
import { Form, Input, Button } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import "./login.css"; // file css custom
import { useLogin } from "../hooks";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const { t } = useTranslation();
  const router = useRouter();

  const loginMutation = useLogin();

  const onFinish = (values: { email: string; password: string }) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Đăng nhập thành công!', {
          position: 'top-right',
        });
        // messageApi.open({
        //   type: 'success',
        //   content: 'Đăng nhập thành công!',
        // });
        router.push('user-management')
      },
      onError: () => {
        toast.error('Đăng nhập thất bại!', {
          position: 'top-right',
        });
      },
    });
  };

  const onFinishFailed = () => {
  };

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
        {t('login.signIn')}
      </h2>

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

      <Form.Item
        name="password"
        label={<span style={{ fontWeight: 600 }}>Password</span>}
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined />}
          placeholder="Password"
          style={{ borderRadius: "6px" }}
        />
      </Form.Item>

      <Form.Item className="mt-6 flex justify-center">
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          style={{ borderRadius: "6px" }}
          loading={loginMutation.isPending}
        >
          SIGN IN
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
