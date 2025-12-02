"use client";

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Table, Input, Select, Button, Card } from "antd";
import { CarOutlined, RocketOutlined, TagsOutlined } from "@ant-design/icons";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

type GoodsFee = {
  name: string;
  fee: string;
};

type ShippingPolicy = {
  serviceFee: string;
  price: string;
  extraFee: string;
  depositRate: string;
};

type FormValues = {
  goodsFees: GoodsFee[];
  air: ShippingPolicy;
  sea: ShippingPolicy;
};

export default function ShippingFeeConfig() {
  const { t } = useTranslation();

  const feeOptions = [
    { value: "fee2", label: t("shippingFeeConfig.feeOptions.fee2") },
    { value: "default", label: t("shippingFeeConfig.feeOptions.default") },
    { value: "fee5", label: t("shippingFeeConfig.feeOptions.fee5") }
  ];

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      goodsFees: [
        { name: t("shippingFeeConfig.defaultData.computer"), fee: "fee2" },
        { name: t("shippingFeeConfig.defaultData.audio"), fee: "default" },
      ],
      air: {
        serviceFee: "3%",
        price: "180000",
        extraFee: "60000",
        depositRate: "100%",
      },
      sea: {
        serviceFee: "2%",
        price: "90000",
        extraFee: "100000",
        depositRate: "100%",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "goodsFees",
  });

  const onSubmit = (values: FormValues) => {
    console.log("✅ Saved Values:", values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1>{t("shippingFeeConfig.title")}</h1>
      <p>{t("shippingFeeConfig.description")}</p>

      {/* --- Fee policy by goods type --- */}
      <Card
        className="!mb-3"
        title={
          <span>
            <TagsOutlined className="mr-2 text-blue-800" />
            {t("shippingFeeConfig.goodsFeePolicyTitle")}
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined className="!font-bold"/>}
            onClick={() => append({ name: "", fee: "" })}
            className="!bg-green-500 !font-bold"
          >
            {t("shippingFeeConfig.addButton")}
          </Button>
        }
      >
        <Table
          dataSource={fields}
          rowKey={(row) => row.id}
          pagination={false}
          columns={[
            {
              title: t("shippingFeeConfig.goodsType"),
              dataIndex: "name",
              render: (_, __, index) => (
                <Controller
                  control={control}
                  name={`goodsFees.${index}.name`}
                  render={({ field }) => (
                    <Input {...field} placeholder={t("shippingFeeConfig.goodsTypePlaceholder")} />
                  )}
                />
              ),
            },
            {
              title: t("shippingFeeConfig.feeLevel"),
              dataIndex: "fee",
              render: (_, __, index) => (
                <Controller
                  control={control}
                  name={`goodsFees.${index}.fee`}
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="w-full"
                      placeholder={t("shippingFeeConfig.selectFeePlaceholder")}
                    >
                      {feeOptions.map((opt) => (
                        <Select.Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              ),
            },
            {
              title: t("shippingFeeConfig.actions"),
              align: "center" as const,
              render: (_, __, index) => (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(index)}
                />
              ),
            },
          ]}
        />
      </Card>

      <Card
        title={
          <span>
            <RocketOutlined className="mr-2 text-blue-800" />
            {t("shippingFeeConfig.airShippingTitle")}
          </span>
        }
        className="!mb-3 [&_.ant-card-head]:!bg-blue-100 [&_.ant-card-head-title]:!text-blue-800"
      >
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              {t("shippingFeeConfig.serviceFee")}
            </label>
            <Controller
              control={control}
              name="air.serviceFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              {t("shippingFeeConfig.shippingPrice")}
            </label>
            <Controller
              control={control}
              name="air.price"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">{t("shippingFeeConfig.extraFee")}</label>
            <Controller
              control={control}
              name="air.extraFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">{t("shippingFeeConfig.depositRate")}</label>
            <Controller
              control={control}
              name="air.depositRate"
              render={({ field }) => <Input {...field} />}
            />
          </div>
        </div>
      </Card>

      <Card
        title={
          <span>
            <CarOutlined className="mr-2 text-blue-800" />
            {t("shippingFeeConfig.seaShippingTitle")}
          </span>
        }
        className="!mb-3 [&_.ant-card-head]:!bg-green-100 [&_.ant-card-head-title]:!text-green-800"
      >
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              {t("shippingFeeConfig.serviceFee")}
            </label>
            <Controller
              control={control}
              name="sea.serviceFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              {t("shippingFeeConfig.shippingPrice")}
            </label>
            <Controller
              control={control}
              name="sea.price"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">{t("shippingFeeConfig.extraFee")}</label>
            <Controller
              control={control}
              name="sea.extraFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">{t("shippingFeeConfig.depositRate")}</label>
            <Controller
              control={control}
              name="sea.depositRate"
              render={({ field }) => <Input {...field} />}
            />
          </div>
        </div>
      </Card>

      {/* --- Save button --- */}
      <div className="flex justify-end">
        <Button type="primary" htmlType="submit">
          {t("shippingFeeConfig.saveButton")}
        </Button>
      </div>
    </form>
  );
}