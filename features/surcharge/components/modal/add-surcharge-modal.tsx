import React from "react";
import { Modal, Form, Select, InputNumber, Button } from "antd";

interface AddSurchargeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const { Option } = Select;

const AddSurchargeModal: React.FC<AddSurchargeModalProps> = ({
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
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      open={visible}
      title="Thêm Phụ thu mới"
      onCancel={onCancel}
      footer={null}
      className="rounded-xl"
      centered
    >
      <Form form={form} layout="vertical">
        {/* Quốc gia */}
        <Form.Item
          label="Quốc gia"
          name="country"
          rules={[{ required: true, message: "Vui lòng chọn quốc gia!" }]}
        >
          <Select placeholder="Chọn quốc gia">
            <Option value="japan">🇯🇵 Nhật Bản (Japan)</Option>
            <Option value="us">🇺🇸 Hoa Kỳ (US)</Option>
          </Select>
        </Form.Item>

        {/* Loại sản phẩm */}
        <Form.Item
          label="Loại sản phẩm"
          name="productType"
          rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm!" }]}
        >
          <Select placeholder="Chọn loại sản phẩm">
            <Option value="fashion">Thời trang</Option>
            <Option value="electronics">Điện tử</Option>
            <Option value="cosmetics">Mỹ phẩm</Option>
          </Select>
        </Form.Item>

        {/* Điều kiện giá */}
        <Form.Item
          label="Điều kiện giá"
          name="condition"
          rules={[{ required: true, message: "Vui lòng chọn điều kiện giá!" }]}
        >
          <Select placeholder="Chọn điều kiện giá">
            <Option value="gte">Lớn hơn hoặc bằng (≥)</Option>
            <Option value="range">Khoảng</Option>
          </Select>
        </Form.Item>

        {/* Từ giá */}
        <Form.Item
          label="Từ giá"
          name="fromPrice"
          rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
        >
          <InputNumber
            className="!w-full"
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
        {/* Phụ thu (%) */}
        <Form.Item
          label="Phụ thu (%)"
          name="surcharge"
          rules={[{ required: true, message: "Vui lòng nhập phụ thu!" }]}
          
        >
          <InputNumber formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, "")
            } className="!w-full" min={0} max={100} step={0.1} />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" onClick={handleOk}>
            Thêm phụ thu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddSurchargeModal;
