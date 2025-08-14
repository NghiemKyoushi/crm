import React from 'react';
import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();

  const onFinish = (values: LoginFormValues) => {
    console.log('Form values:', values);
    // Gửi dữ liệu đăng nhập ở đây
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 400, margin: '0 auto', padding: '2rem' }}
    >
      <h2 style={{ textAlign: 'center' }}>Sign In</h2>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>

      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <a href="#">Forgotten?</a>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          SIGN IN
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Dont have an account? <a href="#">Register</a>
      </div>
    </Form>
  );
};

export default LoginForm;
