"use client";

import React from "react";
import { Form, InputNumber, Button, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faConciergeBell,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useListService } from "@/features/order-hub/hooks/orderhub";
import { ServiceFee } from "@/types/fee-setting";

export default function ShippingServiceForm() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { data: listService } = useListService();

  const handleSubmit = (values: Record<string, any>) => {
    if (!listService) return;

    // map lại để trả về object ServiceFee với amount cập nhật
    const updatedFees: ServiceFee[] = listService.map((service: ServiceFee) => ({
      ...service,
      amount: values[service.code] ?? service.amount,
    }));

    console.log("✅ Updated Fees:", updatedFees);

    // TODO: call API save ở đây
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {/* Phí dịch vụ khác */}
      <Card
        title={
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <FontAwesomeIcon icon={faConciergeBell} className="w-5 h-5" />
            {t("feeSettings.otherServiceFees")}
          </div>
        }
        className="mb-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {listService?.map((item: ServiceFee) => (
            <div
              key={item.code}
              className="!bg-gray-50 p-4 !rounded-lg !border !border-gray-200 !space-y-3"
            >
              <Form.Item
                label={item.name}
                name={item.code}
                initialValue={item.amount ?? 0}
                rules={[
                  { required: true, message: t("validation.required") },
                ]}
              >
                <InputNumber
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: any) => value?.replace(/\D/g, "")}
                  className="!w-full"
                  min={0}
                />
              </Form.Item>
            </div>
          ))}
        </div>
      </Card>

      {/* Save button */}
      <div className="text-right border-t-gray-100 pt-6 mt-8">
        <Button
          type="primary"
          htmlType="submit"
          className="bg-blue-600 hover:!bg-blue-700 px-6 h-11 font-bold"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />
          {t("common.saveAllChanges")}
        </Button>
      </div>
    </Form>
  );
}
