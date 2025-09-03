import { Modal, Form, Input, Select, Button } from "antd";
import { useState } from "react";

const { Option } = Select;

export default function AddBankAccountModal({ open, onCancel, onOk }: any) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);
      onOk?.(values);
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  return (
    <Modal
      title="Thêm tài khoản Ngân hàng mới"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Lưu
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
        }}
      >
        <Form.Item
          label="Tên ngân hàng"
          name="bank_name"
          rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}
        >
          <Input placeholder="VD: Vietcombank" />
        </Form.Item>

        <Form.Item
          label="Số tài khoản"
          name="account_number"
          rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
        >
          <Input placeholder="VD: 0123456789" />
        </Form.Item>

        <Form.Item
          label="Tên chủ tài khoản"
          name="account_holder"
          rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản" }]}
        >
          <Input placeholder="VD: CTY TNHH ORDER SYSTEM" />
        </Form.Item>

        <Form.Item label="Hạn mức/ngày (VND)" name="limit">
          <Input placeholder="VD: 500000000" />
        </Form.Item>

        <Form.Item label="Trạng thái" name="status">
          <Select>
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Ngừng hoạt động</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
