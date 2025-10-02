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
          <div className="flex items-center gap-2 text-base font-medium text-gray-800">
            <FontAwesomeIcon icon={faConciergeBell} className="w-4 h-4"/> {t('feeSettings.otherServiceFees')}
          </div>
        }
        className="mb-6 rounded-lg shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <Form.Item
              label={<span className="text-sm text-gray-700">{t('feeSettings.purchaseFeeUs')}</span>}
              name={["serviceFee", "us"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" size="large" min={0} />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm text-gray-700">{t('feeSettings.purchaseFeeJp')}</span>}
              name={["serviceFee", "jp"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" size="large" min={0} />
            </Form.Item>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <Form.Item
              label={<span className="text-sm text-gray-700">{t('feeSettings.reinforcementFee')}</span>}
              name={["serviceFee", "extraKg"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" size="large" min={0} />
            </Form.Item>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <Form.Item
              label={<span className="text-sm text-gray-700">{t('feeSettings.checkPhotoFeeUs')}</span>}
              name={["serviceFee", "checkUs"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" size="large" min={0} />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm text-gray-700">{t('feeSettings.checkPhotoFeeJp')}</span>}
              name={["serviceFee", "checkJp"]}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <InputNumber className="!w-full" size="large" min={0} />
            </Form.Item>
          </div>
        </div>
      </Card>

      {/* Save button */}
      <div className="text-right border-t border-gray-200 pt-6 mt-8">
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          icon={<FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />}
          className="!bg-blue-600 hover:!bg-blue-700 !px-8"
        >
          {t('common.saveAllChanges')}
        </Button>
      </div>
    </Form>
  );
}
