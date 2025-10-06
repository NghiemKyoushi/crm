"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, InputNumber, Radio, Input, Button, Alert } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { getDataWeight } from "../../apis/orderhub";

interface CheckOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  orderCode: string;
  customerName: string;
  productName?: string;
  feePerKg: number;
  customerId: number;
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
  customerId,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [feeKg, setFeeKg] = useState(0);
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...values, weight_rate_fee: feeKg });
      form.resetFields();
    } catch {
      // Error validation will be highlighted
    }
  };

  useEffect(() => {
    const fetchWeight = async () => {
      if (open && customerId) {
        try {
          console.log("customerId", customerId);
          const res = await getDataWeight(customerId);
          console.log("res", res);
          setFeeKg(res);
        } catch (error) {
          console.error("Error fetching weight:", error);
        }
      }
    };

    fetchWeight();
  }, [open, customerId]);

  // Get form values realtime to calculate fees
  const actualWeight = Form.useWatch("actualWeight", form);
  const codFee = Form.useWatch("codFee", form);

  useEffect(() => {
    if (actualWeight) {
      const weightFee = actualWeight * feeKg;
      console.log("feeKg", weightFee);

      form.setFieldsValue({
        feePerKg: weightFee,
      });
    }
  }, [actualWeight, feeKg, form]);

  return (
    <Modal
      title={t("modal.inspectAndCalculateFee")}
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
      {/* Order Information */}
      <div className="bg-blue-50 p-3 rounded mb-4">
        <p className="!mb-1">
          <strong>{t("table.orderCode")}:</strong> {orderCode}
        </p>
        <p className="!mb-1">
          <strong>{t("form.customer")}:</strong> {customerName}
        </p>
        <p className="!mb-1">
          <strong>{t("form.productName")}:</strong> {productName ?? "N/A"}
        </p>
      </div>

      <Form layout="vertical" form={form}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="actualWeight"
            label={t("inspection.actualWeight")}
            rules={[
              { required: true, message: t("validation.weight.required") },
            ]}
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
          <Form.Item name="feePerKg" label={t("inspection.weightFee")}>
            <InputNumber
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              className="!w-full"
              disabled
            />
          </Form.Item>
        </div>
        <Form.Item name="note" label={t("inspection.note")}>
          <Input.TextArea
            className="!h-25"
            placeholder={t("inspection.notePlaceholder")}
          />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>{t("button.cancel")}</Button>
          <Button
            type="primary"
            className="!bg-green-600"
            icon={<FontAwesomeIcon icon={faCheck} />}
            onClick={handleOk}
          >
            {t("button.inspectGoods")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CheckOrderModal;
