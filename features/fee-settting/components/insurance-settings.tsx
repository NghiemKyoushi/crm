"use client";

import React from "react";
import { Form, InputNumber, Button, Card, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSave, faShield } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

interface InsuranceFormValues {
  usDefault: number;
  jpDefault: number;
  highValue: number;
  freeDays: number;
  storageFee: number;
  depositRate: number;
}

const InsuranceSettings: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<InsuranceFormValues>();

  const onFinish = (values: InsuranceFormValues) => {
    message.success(t("insuranceSettings.saveSuccess"));
  };

  return (
    <div className="space-y-6">
      {/* Cài đặt bảo hiểm */}
      <Card
        title={
          <div className="flex items-center gap-2 font-bold text-lg">
            <FontAwesomeIcon icon={faShield} className="w-5 h-5 " />
            {t("insuranceSettings.title")}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gói mặc định */}
          <div className=" bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
            <h3 className=" mb-4 font-semibold text-blue-800">
              {t("insuranceSettings.defaultPackage")}
            </h3>
            <p className="text-sm text-blue-600 mb-2">
             {t("insuranceSettings.maxCompensation")}
            </p>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label={t("insuranceSettings.usRoute")}
                name="usDefault"
                rules={[{ required: true, message: t("validation.required") }]}
                className="!mb-1"
              >
                <InputNumber className="!w-full" min={0} />
              </Form.Item>

              <Form.Item
              className="!mb-1"
                label={t("insuranceSettings.jpRoute")}
                name="jpDefault"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <InputNumber className="!w-full" min={0} />
              </Form.Item>
            </Form>
          </div>

          {/* Gói giá trị cao */}
          <div className="bg-yellow-50 p-4 rounded-lg space-y-3 border border-yellow-200">
            <h3 className=" mb-4 font-semibold text-yellow-800">{t("insuranceSettings.highValuePackage")}</h3>
            <p className="text-sm text-yellow-600 mb-2">
              {t("insuranceSettings.fullCompensation")}
            </p>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label={t("insuranceSettings.insuranceFeePercent")}
                name="highValue"
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <InputNumber className="!w-full" min={0} max={100} />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>

      {/* Quy định chung */}
      <Card
        title={
          <div className="flex items-center gap-2 font-bold text-lg">
            <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 " />
            {t("insuranceSettings.generalRegulations")}
          </div>
        }
        className="!mt-8"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item
              label={t("insuranceSettings.freeStorageDays")}
              name="freeDays"
              rules={[{ required: true, message: t("validation.required") }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>

            <Form.Item
              label={t("insuranceSettings.storageFeeAfter")}
              name="storageFee"
              rules={[{ required: true, message: t("validation.required") }]}
            >
              <InputNumber className="!w-full" min={0} />
            </Form.Item>

            <Form.Item
              label={t("insuranceSettings.minDepositRate")}
              name="depositRate"
              rules={[{ required: true, message: t("validation.required") }]}
            >
              <InputNumber className="!w-full" min={0} max={100} />
            </Form.Item>
          </div>

          
        </Form>
      </Card>
      <div className="text-right border-t-gray-100 pt-6 mt-8">
            <button
              className="bg-blue-600 hover:bg-blue-700 !text-white !font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
             <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" /> {t("insuranceSettings.saveAllChanges")}
            </button>
          </div>
    </div>
  );
};

export default InsuranceSettings;
