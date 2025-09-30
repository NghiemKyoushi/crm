"use client";

import React from "react";
import { Form, InputNumber, Button, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faList, faSave, faConciergeBell } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

type FormValues = {
  serviceFee: {
    us: number;
    jp: number;
    extraKg: number;
    checkUs: number;
    checkJp: number;
  };
  delivery: {
    kv1: { fee: number; freeUs: number; freeJp: number };
    kv2: { fee: number; freeUs: number; freeJp: number };
    kv3: { fee: number };
  };
};

export default function ShippingServiceForm() {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = (values: FormValues) => {
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        serviceFee: { us: 4, jp: 3, extraKg: 5000, checkUs: 5, checkJp: 10000 },
        delivery: {
          kv1: { fee: 50000, freeUs: 10, freeJp: 5 },
          kv2: { fee: 100000, freeUs: 20, freeJp: 10 },
          kv3: { fee: 200000 },
        },
      }}
    >
      {/* Phí dịch vụ khác */}
      <Card
        title={
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <FontAwesomeIcon icon={faConciergeBell} className="w-5 h-5"/> {t('feeSettings.otherServiceFees')}
          </div>
        }
        className="mb-6"
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="!bg-gray-50 p-4 !rounded-lg !border !border-gray-200 !space-y-3">
            <Form.Item
              label={t('feeSettings.purchaseFeeUs')}
              name={["serviceFee", "us"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item
              label={t('feeSettings.purchaseFeeJp')}
              name={["serviceFee", "jp"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>

          <div className="!bg-gray-50 p-4 !rounded-lg !border !border-gray-200 !space-y-3">
            <Form.Item
              label={t('feeSettings.reinforcementFee')}
              name={["serviceFee", "extraKg"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>

          <div className="!bg-gray-50 p-4 !rounded-lg !border !border-gray-200 !space-y-3">
            <Form.Item
              label={t('feeSettings.checkPhotoFeeUs')}
              name={["serviceFee", "checkUs"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item
              label={t('feeSettings.checkPhotoFeeJp')}
              name={["serviceFee", "checkJp"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      </Card>

      {/* Save button */}
      <div className="text-right border-t-gray-100 pt-6 mt-8">
        <Button
          type="primary"
          htmlType="submit"
          className="bg-blue-600 hover:!bg-blue-700 px-6 h-11 font-bold"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" /> {t('common.saveAllChanges')}
        </Button>
      </div>
    </Form>
  );
}
