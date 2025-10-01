"use client";

import React from "react";
import { Form, InputNumber, Button, Card, message, Spin } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faSave,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useListInsurance, useUpdateInsurance } from "../hooks/fee-setting";
import { InsuranceOption } from "@/types/fee-setting";
import { toast } from "react-toastify";

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

  const { data: listInsurance, isPending } = useListInsurance();
  const updateInsuranceMutation = useUpdateInsurance();
  const onFinish = (values: any) => {
    // values.insurance = { id: { fee_percentage: number }, ... }
    const result = listInsurance.map((item: InsuranceOption) => ({
      ...item,
      fee_percentage:
        values.insurance?.[item.id]?.fee_percentage ?? item.fee_percentage,
    }));
    updateInsuranceMutation.mutate(
      {
        body: result,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật thành công!");
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Cài đặt bảo hiểm */}
      <Spin spinning={isPending} />
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card
          title={
            <div className="flex items-center gap-2 font-bold text-lg">
              <FontAwesomeIcon icon={faShield} className="w-5 h-5 " />
              {t("insuranceSettings.title")}
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listInsurance?.map((item: InsuranceOption) => (
              <div
                key={item.id}
                className=" bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h3 className=" font-semibold text-blue-800">{item.name}</h3>
                  <p className="text-sm text-blue-600">{item.description}</p>
                </div>

                <Form.Item
                  label="Phần trăm phí"
                  name={["insurance", item.id, "fee_percentage"]}
                  initialValue={item.fee_percentage ? item.fee_percentage : 0}
                  rules={[
                    { required: true, message: t("validation.validationField") },
                  ]}
                  className="!mb-0 mt-4"
                >
                  <InputNumber className="!w-full" min={0} />
                </Form.Item>
              </div>
            ))}
          </div>
        </Card>

        {/* Quy định chung */}
        {/* <Card
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
        </Card> */}
        <div className="text-right border-t-gray-100 pt-6 mt-8">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 !text-white !font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />{" "}
            {t("insuranceSettings.saveAllChanges")}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default InsuranceSettings;
