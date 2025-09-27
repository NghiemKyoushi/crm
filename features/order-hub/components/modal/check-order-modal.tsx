"use client";

import React from "react";
import { Modal, Form, InputNumber, Radio, Input, Button, Alert } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

interface CheckOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  orderCode: string;
  customerName: string;
  productName?: string;
  feePerKg: number;
}

interface FormValues {
  actualWeight: number;
  codFee: string;
  note?: string;
}

const CheckOrderModal: React.FC<CheckOrderModalProps> = ({
  open,
  onCancel,
  onSubmit,
  orderCode,
  customerName,
  productName,
  feePerKg,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch {
      // lỗi validate sẽ được highlight
    }
  };

  // Lấy giá trị form realtime để tính phí
  const actualWeight = Form.useWatch("actualWeight", form) || 0;
  const codFee = Form.useWatch("codFee", form);

  const weightFee = actualWeight * feePerKg;
  const codDisplay = codFee === "FIXED" ? "Đã tính" : "Tính sau";

  return (
    <Modal
      title="Kiểm hàng và tính phí"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={650}
      styles={{
        body: {
          maxHeight: "80vh",
          overflowY: "auto",
          paddingRight: "8px",
        },
      }}
      centered
    >
      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 p-3 rounded mb-4">
        <p className="!mb-1">
          <strong>Mã đơn:</strong> {orderCode}
        </p>
        <p className="!mb-1">
          <strong>Khách hàng:</strong> {customerName}
        </p>
        <p className="!mb-1">
          <strong>Sản phẩm:</strong> {productName ?? "N/A"}
        </p>
      </div>

      <Form layout="vertical" form={form}>
        {/* Cân nặng */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="actualWeight"
            label="Cân nặng thực tế (kg)"
            rules={[{ required: true, message: "Vui lòng nhập cân nặng!" }]}
          >
            <InputNumber
              className="!w-full"
              min={0}
              placeholder="0.0"
              step={0.1}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
          <Form.Item name="feePerKg" label="Phí cân nặng (VND/kg)">
            <InputNumber
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              className="!w-full"
            />
          </Form.Item>
        </div>

        {/* Cảnh báo COD */}
        {/* <Alert
          message={
            <p className="font-semibold text-yellow-800 text-xs m-0">
              Phí COD chưa được thiết lập
            </p>
          }
          description={
            <p className="text-xs text-yellow-700 m-0">
              Đơn hàng này chưa có phí COD. Vui lòng thiết lập phí COD bên dưới.
            </p>
          }
          type="warning"
          showIcon
          icon={
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-yellow-600"
            />
          }
          className="!py-1 !px-2 !pt-3" // thu nhỏ chiều cao
        /> */}

        {/* Phí COD */}
        {/* <Form.Item
          className="!mt-2"
          name="codFee"
          label="Phí COD"
          rules={[{ required: true, message: "Vui lòng chọn phí COD!" }]}
        >
          <Radio.Group className="!flex !flex-col !gap-2">
            <Radio value="FIXED">Điền phí cố định</Radio>
            <Radio value="LATER">Đợi tính phí sau</Radio>
          </Radio.Group>
        </Form.Item> */}

        {/* Tính toán phí */}
        {/* <div className="bg-gray-50 rounded p-3 mb-4">
          <p className="font-semibold text-gray-700 mb-3">Tính toán phí</p>
          <p className="space-y-2 text-sm flex flex-row justify-between">
            Phí cân nặng: <span>{weightFee.toLocaleString()} đ</span> 
          </p>
          <p className="space-y-2 text-sm flex flex-row justify-between">Phí COD: <span>{codDisplay}</span></p>
          <div className="border-t border-gray-300 my-2"></div>

          <p className="text-red-600 font-semibold flex flex-row justify-between">
            Tổng phí phát sinh: <span>{weightFee.toLocaleString()} đ</span>  
          </p>
        </div> */}

        {/* Ghi chú */}
        <Form.Item name="note" label="Ghi chú kiểm hàng">
          <Input.TextArea
            className="!h-25"
            placeholder="Ghi chú về tình trạng hàng hóa, phí phát sinh..."
          />
        </Form.Item>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            className="!bg-green-600"
            icon={<FontAwesomeIcon icon={faCheck} />}
            onClick={handleOk}
          >
            Xác nhận kiểm hàng
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CheckOrderModal;
