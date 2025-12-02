"use client";
import React, { useState, useEffect, useMemo } from "react";

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

import { Form, InputNumber, Button, Card, Select } from "antd";
import { SaveOutlined, NodeIndexOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  useListDataGeneral,
  useUpdateListService,
} from "@/features/order-hub/hooks/orderhub";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

export interface Fees {
  code: string;
  amount: number;
  currency_code: string;
  route_id: number;
}

export interface FeeData {
  customer_group_id?: number;
  fees: Fees[];
}

interface ShippingServiceFormProps {
  groupId?: number;
}
export default function ShippingServiceForm(props: ShippingServiceFormProps) {
  const { groupId } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [currencyChanges, setCurrencyChanges] = useState<Record<string, string>>({});

  const { data: listService, isPending } = useListDataGeneral(
    groupId ? { customerGroupId: groupId } : undefined
  );
  const updateServiceMutation = useUpdateListService();

  // Build currency data from API response and user changes
  const currencyData = useMemo(() => {
    const result: Record<string, string> = {};

    if (listService) {
      listService.forEach((routeItem: ServiceFee) => {
        routeItem.fees.forEach((fee: Fee) => {
          const key = `${routeItem.route.id}_${fee.code}`;
          // Use user change if exists, otherwise use API value
          result[key] = currencyChanges[key] || fee.currency_code || "VND";
        });
      });
    }

    return result;
  }, [listService, currencyChanges]);

  // Build initial form values from API response
  const initialValues = useMemo(() => {
    const formValues: Record<string, number> = {};
    if (listService) {
      listService.forEach((routeItem: ServiceFee) => {
        routeItem.fees.forEach((fee: Fee) => {
          const key = `${routeItem.route.id}_${fee.code}`;
          formValues[key] = fee.amount ?? 0;
        });
      });
    }
    console.log('Initial values:', formValues);
    return formValues;
  }, [listService]);

  // Log currency data for debugging
  useEffect(() => {
    if (Object.keys(currencyData).length > 0) {
      console.log('Currency data:', currencyData);
    }
  }, [currencyData]);
  const handleSubmit = (values: Record<string, any>) => {
    if (!listService) return;
    // const dataCheck: Fees[] = [],
    // const updated: FeeData = listService.map(
    //   (routeItem: ServiceFee) => ({

    //     // ...routeItem,
    //     fees: routeItem.fees.map((fee: Fee) => ({
    //       dataCheck.push({

    //         // ...fee,
    //         // amount: values[`${routeItem.route.id}_${fee.code}`] ?? fee.amount
    //       })

    //     })),
    //     // customer_group_id: groupId ? groupId : null,
    //   })
    // );
    // Mảng chứa các fees đã được cập nhật
    const dataCheck: Fees[] = [];

    // Lặp qua từng route
    listService.forEach((routeItem: ServiceFee) => {
      routeItem.fees.forEach((fee: Fee) => {
        const key = `${routeItem.route.id}_${fee.code}`;
        const inputAmount = values[key];

        // Nếu người dùng có nhập (hoặc giữ nguyên giá trị cũ)
        if (inputAmount !== undefined) {
          dataCheck.push({
            code: fee.code,
            amount: inputAmount,
            currency_code: currencyData[key] || fee.currency_code,
            route_id: routeItem.route.id,
          });
        }
      });
    });

    updateServiceMutation.mutate(
      {
        param: {
          customer_group_id: groupId,
          fees: dataCheck,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("shippingSettings.updateFeeSuccess"));
          queryClient.invalidateQueries({ queryKey: ["listService"] });
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );

  };

  if (isPending || !listService) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      {listService.map((routeItem: ServiceFee) => (
        <Card
          key={routeItem.route.id}
          title={
            <div className="flex items-center gap-2 font-bold text-gray-700">
              <NodeIndexOutlined className="w-5 h-5" />
              {routeItem.route.name ||
                `${routeItem.route.origin} → ${routeItem.route.destination}`}
            </div>
          }
          className="mb-6 rounded-lg shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {routeItem.fees.map((fee: Fee) => {
              const key = `${routeItem.route.id}_${fee.code}`;

              // Filter currency options based on route
              const isUSRoute = routeItem.route.code === "US_VN";
              const isJPRoute = routeItem.route.code === "JP_VN";

              const currencyOptions = [
                { label: "VND", value: "VND" },
                ...(isUSRoute ? [{ label: "USD", value: "USD" }] : []),
                ...(isJPRoute ? [{ label: "JPY", value: "JPY" }] : []),
                { label: "%", value: "%" },
              ];

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fee.name}
                  </label>
                  <Form.Item
                    name={key}
                    rules={[{ required: true, message: t("validation.required") }]}
                    className="!mb-0"
                  >
                    <InputNumber
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: any) => value?.replace(/\D/g, "")}
                      className="!w-full"
                      min={0}
                      addonAfter={
                        <Select
                          className="!w-20 !border-0"
                          value={currencyData[key]}
                          onChange={(value) =>
                            setCurrencyChanges((prev) => ({
                              ...prev,
                              [key]: value,
                            }))
                          }
                          options={currencyOptions}
                        />
                      }
                    />
                  </Form.Item>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Nút lưu */}
      <div className="text-right border-t border-gray-200 pt-6 mt-8">
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          icon={<SaveOutlined className="mr-2 w-4 h-4" />}
          className="!bg-blue-600 hover:!bg-blue-700 !px-8"
        >
          {t("common.saveAllChanges")}
        </Button>
      </div>
    </Form>
  );
}
