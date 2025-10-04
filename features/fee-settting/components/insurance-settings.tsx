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
import {
  useListGeneralPolicy,
  useListInsurance,
  useUpdateInsurance,
} from "../hooks/fee-setting";
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
  const [formGeneral] = Form.useForm();

  const { data: listInsurance, isPending } = useListInsurance();
  const { data: listGereralPolicy } =
    useListGeneralPolicy();

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

  const onFinishGeneral = (values: any) => {
    // updateGeneralPolicyMutation.mutate(values, {
    //   onSuccess: () => toast.success("Cập nhật quy định thành công!"),
    //   onError: (err: any) => toast.error(err.response?.data?.localizedMessage || t("common.error")),
    // });
  };

  React.useEffect(() => {
    console.log('listGereralPolicy?.data', listGereralPolicy);

    if (listGereralPolicy) {
      console.log('listGereralPolicy?.data', listGereralPolicy?.data);
      
      formGeneral.setFieldsValue({
        free_storage_days: listGereralPolicy.free_storage_days ?? 0,
        storage_fee_per_kg_per_day: listGereralPolicy.storage_fee_per_kg_per_day ?? 0,
        min_deposit_percent: listGereralPolicy.min_deposit_percent ?? 0,
      });
    }
  }, [listGereralPolicy, formGeneral]);

  return (
    <div className="space-y-6">
      {/* Cài đặt bảo hiểm */}
      <Spin spinning={isPending} />
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card
          title={
            <div className="flex items-center gap-2 text-base font-medium text-gray-800">
              <FontAwesomeIcon icon={faShield} className="w-4 h-4" />
              {t("insuranceSettings.title")}
            </div>
          }
          className="rounded-lg shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listInsurance?.map((item: InsuranceOption) => (
              <div
                key={item.id}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col justify-between"
              >
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-medium text-blue-800">
                    {item.name}
                  </h3>
                  <p className="text-xs text-blue-600">{item.description}</p>
                </div>

                <Form.Item
                  label={
                    <span className="text-sm text-gray-700">Phần trăm phí</span>
                  }
                  name={["insurance", item.id, "fee_percentage"]}
                  initialValue={item.fee_percentage ? item.fee_percentage : 0}
                  rules={[
                    {
                      required: true,
                      message: t("validation.validationField"),
                    },
                  ]}
                  className="!mb-0"
                >
                  <InputNumber className="!w-full" size="large" min={0} />
                </Form.Item>
              </div>
            ))}
          </div>
        </Card>

        {/* Quy định chung */}

        <div className="text-right border-t border-gray-200 pt-6 mt-8 mb-8">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />}
            className="!bg-blue-600 hover:!bg-blue-700 !px-8"
          >
            {t("insuranceSettings.saveAllChanges")}
          </Button>
        </div>
      </Form>

      <Form
        form={formGeneral}
        layout="vertical"
        onFinish={onFinishGeneral}
        className="mt-8"
      >
        <Card title="Quy định chung">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item
              name="free_storage_days"
              label={t("insuranceSettings.freeStorageDays")}
            >
              <InputNumber min={0} className="!w-full" />
            </Form.Item>
            <Form.Item
              name="storage_fee_per_kg_per_day"
              label={t("insuranceSettings.storageFeeAfter")}
            >
              <InputNumber min={0} className="!w-full" />
            </Form.Item>
            <Form.Item
              name="min_deposit_percent"
              label={t("insuranceSettings.minDepositRate")}
            >
              <InputNumber min={0} max={100} className="!w-full" />
            </Form.Item>
          </div>
        </Card>
        <div className="text-right pt-4">
        <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />}
            className="!bg-blue-600 hover:!bg-blue-700 !px-8"
          >
            {t("insuranceSettings.saveAllChanges")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InsuranceSettings;
