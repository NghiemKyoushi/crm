"use client";

import React, { useState } from "react";
import { Form, Input, Button, Modal, Space } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useForgotPassword, useResendOTP, useVerifyOTP } from "../hooks";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ForgotPasswordFormValues {
  email: string;
}
interface LoginFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = (props: LoginFormProps) => {
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const { t } = useTranslation();

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  const forgotPassMutation = useForgotPassword();
  const verifyOTPMutation = useVerifyOTP();
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
        console.log('err', err);
        if(err.status === 409){
          toast.error("Hãy đợi 5 phút rồi thử lại! ");
        }else{
          toast.error("Email không tồn tại!");
        }
      },
    });
  };

  const handleOtpConfirm = () => {
    verifyOTPMutation.mutate(
      { email: emailValue, otp: otpValue },
      {
        onSuccess: () => {
          toast.success("Xác nhận OTP thành công , password mới đã được reset !");
          setOtpModalVisible(false);
          props.onBack();
        },
        onError: () => {
          toast.error("OTP không chính xác!");
        },
      }
    );
  };

  const handleResendOtp = () => {
    resendOTPMutation.mutate(
      { email: emailValue },
      {
        onSuccess: () => {
          toast.success("OTP mới đã được gửi!");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
           if(err.status === 409){
          toast.error("Hãy đợi 5 phút rồi thử lại! ");
        }else{
           toast.error("Hãy đợi 5 phút rồi thử lại! ");
        }
          
          
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
          minHeight: "380px",
          padding: "2rem",
          background: "white",
          borderRadius: "30px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          border: "3px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <Button
            type="link"
            onClick={props.onBack}
            className="flex items-start gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="to-blue-400" />
          </Button>

          <h2 className="font-bold text-2xl mb-0 bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent tracking-wide">
            {t("login.forgotPassword")}
          </h2>

          {/* để cân bằng 2 bên (giữ title ở giữa) */}
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

        <Form.Item className="!mt-10 flex justify-center text-[14px] rounded-md">
          <Button type="primary" htmlType="submit" size="large">
            Gửi mã xác nhận
          </Button>
        </Form.Item>
      </Form>

      {/* OTP Modal */}
      <Modal
        title={null}
        open={otpModalVisible}
        onCancel={() => setOtpModalVisible(false)}
        footer={null}
        centered
        width={360}
        className="rounded-2xl"
      >
        <div className="text-center p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Xác thực OTP
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            Nhập mã OTP 6 số đã gửi đến email của bạn
          </p>

          {/* Input OTP */}
          <Input.OTP
            length={6}
            value={otpValue}
            onChange={(val) => setOtpValue(val)}
            size="large"
            className="flex justify-center gap-2"
            style={{ width: "100%", justifyContent: "center" }}
          />

          {/* Buttons */}
          <Space direction="vertical" className="w-full mt-7">
            <Button
              type="primary"
              size="middle"
              block
              className="rounded-lg"
              loading={verifyOTPMutation.isPending}
              onClick={handleOtpConfirm}
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
      </Modal>
    </>
  );
};

export default ForgotPasswordForm;
