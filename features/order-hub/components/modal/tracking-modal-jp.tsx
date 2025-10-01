"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Space } from "antd";
import { TruckOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface TrackingModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { trackingCodes: string[] }) => void;
  orderCode: string;
  customerName: string;
}

const TrackingModalJP: React.FC<TrackingModalProps> = ({
  open,
  onCancel,
  onSubmit,
  orderCode,
  customerName,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    // values.trackingCodes = array string    
    onSubmit(values);
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Thêm mã tracking"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      styles={{
        body: {
          maxHeight: "75vh",
          overflowY: "auto",
        },
      }}
      centered
    >
      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 rounded p-3 mb-2">
        <p className="font-semibold text-blue-900 !mb-1">Thông tin đơn hàng</p>
        <p className="!mb-1">
          <span className="font-semibold">Mã đơn:</span> {orderCode}
        </p>
        <p className="!mb-1">
          <span className="font-semibold">Khách hàng:</span> {customerName}
        </p>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ trackingCodes: [""] }}
        className="!mb-2"
      >
        {/* Danh sách mã tracking */}
        <Form.List name="trackingCodes">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  label={index === 0 ? "Mã tracking" : `Mã kiện ${index + 1}`}
                  required={false}
                  className="!mb-2"
                >
                  <div  className="!w-full flex gap-2">
                    <Form.Item
                      {...field}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          pattern: /^[A-Za-z0-9-]*$/,
                          message: "Mã tracking không hợp lệ",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        className="!h-11 !w-full"
                        placeholder="VD: 1234567890123"
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    )}
                  </div>
                </Form.Item>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm mã kiện
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-purple-600 hover:bg-purple-700"
            icon={<TruckOutlined />}
          >
            Cập nhật tracking
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TrackingModalJP;
