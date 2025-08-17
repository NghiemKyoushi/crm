"use client";

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Table, Input, Select, Button, Card } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

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

const feeOptions = ["Phí 2%", "Mặc định (3%)", "Phí 5%"];

export default function ShippingFeeConfig() {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      goodsFees: [
        { name: "Máy tính", fee: "Phí 2%" },
        { name: "Audio", fee: "Mặc định (3%)" },
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
      {/* --- Chính sách phí theo loại hàng hóa --- */}
      <Card
      className="!mb-3"
        title="Chính sách Phí theo Loại Hàng Hóa"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => append({ name: "", fee: "" })}
          >
            Thêm
          </Button>
        }
      >
        <Table
          dataSource={fields}
          rowKey={(row) => row.id}
          pagination={false}
          columns={[
            {
              title: "Loại Hàng Hóa",
              dataIndex: "name",
              render: (_, __, index) => (
                <Controller
                  control={control}
                  name={`goodsFees.${index}.name`}
                  render={({ field }) => (
                    <Input {...field} placeholder="Nhập loại hàng hóa" />
                  )}
                />
              ),
            },
            {
              title: "Mức Phí Áp Dụng",
              dataIndex: "fee",
              render: (_, __, index) => (
                <Controller
                  control={control}
                  name={`goodsFees.${index}.fee`}
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="w-full"
                      placeholder="Chọn phí"
                    >
                      {feeOptions.map((opt) => (
                        <Select.Option key={opt} value={opt}>
                          {opt}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              ),
            },
            {
              title: "Hành động",
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

      <Card  title="✈️ Chính sách Vận chuyển AIR" className="bg-blue-50 !mb-3">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Phí dịch vụ
            </label>
            <Controller
              control={control}
              name="air.serviceFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Giá vận chuyển
            </label>
            <Controller
              control={control}
              name="air.price"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Phụ phí</label>
            <Controller
              control={control}
              name="air.extraFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Tỷ lệ cọc</label>
            <Controller
              control={control}
              name="air.depositRate"
              render={({ field }) => <Input {...field} />}
            />
          </div>
        </div>
      </Card>

      <Card title="🚢 Chính sách Vận chuyển SEA" className="bg-blue-50 ">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Phí dịch vụ
            </label>
            <Controller
              control={control}
              name="sea.serviceFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Giá vận chuyển
            </label>
            <Controller
              control={control}
              name="air.price"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Phụ phí</label>
            <Controller
              control={control}
              name="air.extraFee"
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Tỷ lệ cọc</label>
            <Controller
              control={control}
              name="air.depositRate"
              render={({ field }) => <Input {...field} />}
            />
          </div>
        </div>
      </Card>

      {/* --- Save button --- */}
      <div className="flex justify-end">
        <Button type="primary" htmlType="submit">
          Lưu
        </Button>
      </div>
    </form>
  );
}
