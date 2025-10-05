"use client";
import React from "react";

// types/fee-setting.ts
export interface Fee {
  id: number;
  code: string;
  name: string;
  optional: boolean;
  method: number;
  description?: string | null;
  amount: number;
  currency_code: string;
  route_id: number;
}

export interface Route {
  id: number;
  code: string;
  name: string;
  origin: string;
  destination: string;
  created_at: string;
}

export interface ServiceFee {
  route: Route;
  fees: Fee[];
}

import { Form, InputNumber, Button, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faRoute } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  useListDataGeneral,
  useUpdateListService,
} from "@/features/order-hub/hooks/orderhub";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

interface ShippingServiceFormProps {
  groupId?: number;
}
export default function ShippingServiceForm(props: ShippingServiceFormProps) {
  const { groupId } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: listService, isPending } = useListDataGeneral(
    groupId ? { customerGroupId: groupId } : undefined
  );
  const updateServiceMutation = useUpdateListService();
  const handleSubmit = (values: Record<string, any>) => {
    if (!listService?.data) return;

    // map lại data để gửi API
    const updated: ServiceFee[] = listService.data.map(
      (routeItem: ServiceFee) => ({
        ...routeItem,
        fees: routeItem.fees.map((fee: Fee) => ({
          ...fee,
          amount: values[`${routeItem.route.id}_${fee.code}`] ?? fee.amount,
        })),
      })
    );

    // updateServiceMutation.mutate(
    //   { param: updated },
    //   {
    //     onSuccess: () => {
    //       toast.success(t("shippingSettings.updateFeeSuccess"));
    //       queryClient.invalidateQueries({ queryKey: ["listService"] });
    //     },
    //     onError: (err: any) =>
    //       toast.error(err.response?.data?.localizedMessage || t("common.error")),
    //   }
    // );

    console.log("✅ Updated:", updated);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {listService?.map((routeItem: ServiceFee) => (
        <Card
          key={routeItem.route.id}
          title={
            <div className="flex items-center gap-2 font-bold text-gray-700">
              <FontAwesomeIcon icon={faRoute} className="w-5 h-5" />
              {routeItem.route.name ||
                `${routeItem.route.origin} → ${routeItem.route.destination}`}
            </div>
          }
          className="mb-6 rounded-lg shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {routeItem.fees.map((fee: Fee) => (
              <Form.Item
                key={`${routeItem.route.id}_${fee.code}`}
                label={fee.name}
                name={`${routeItem.route.id}_${fee.code}`}
                initialValue={fee.amount ?? 0}
                rules={[{ required: true, message: t("validation.required") }]}
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
            ))}
          </div>
        </Card>
      ))}

      {/* Nút lưu */}
      <div className="text-right border-t border-gray-200 pt-6 mt-8">
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          icon={<FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />}
          className="!bg-blue-600 hover:!bg-blue-700 !px-8"
        >
          {t("common.saveAllChanges")}
        </Button>
      </div>
    </Form>
  );
}
