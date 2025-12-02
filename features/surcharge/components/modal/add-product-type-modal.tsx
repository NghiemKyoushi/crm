import React from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { LaptopOutlined, MobileOutlined, ShoppingCartOutlined, SkinOutlined } from "@ant-design/icons";

interface AddProductTypeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const { TextArea } = Input;
const { Option } = Select;

const AddProductTypeModal: React.FC<AddProductTypeModalProps> = ({
  visible,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
        form.resetFields();
      })
      .catch((err) => console.log("Validation Failed:", err));
  };

  return (
    <Modal
      open={visible}
      title="Thêm Loại sản phẩm mới"
      onCancel={onCancel}
      footer={null}
      className="rounded-xl"
      centered
    >
      <Form form={form} layout="vertical">
        {/* Tên loại sản phẩm */}
        <Form.Item
          label="Tên loại sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên loại sản phẩm!" }]}
        >
          <Input placeholder="Ví dụ: Thiết bị y tế" />
        </Form.Item>

        {/* Icon */}
        <Form.Item
          label="Icon"
          name="icon"
          rules={[{ required: true, message: "Vui lòng chọn icon!" }]}
        >
          <Select placeholder="Chọn icon">
            <Option value="laptop">
              <LaptopOutlined className="mr-2" /> Laptop
            </Option>
            <Option value="mobile">
              <MobileOutlined className="mr-2" /> Mobile
            </Option>
            <Option value="fashion">
              <SkinOutlined className="mr-2" /> Thời trang
            </Option>
            <Option value="shopping">
              <ShoppingCartOutlined className="mr-2" /> Hàng tiêu dùng
            </Option>
          </Select>
        </Form.Item>

        {/* Mô tả */}
        <Form.Item label="Mô tả" name="description">
          <TextArea placeholder="Mô tả ngắn về loại sản phẩm" rows={3} />
        </Form.Item>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" className="bg-green-600" onClick={handleOk}>
            Thêm loại sản phẩm
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddProductTypeModal;
