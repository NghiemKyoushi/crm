"use client";

import React from "react";
import { Form, Input, Select, DatePicker, Button } from "antd";
// import type { FormInstance } from "antd/es/form";
import moment from "moment";

type FilterValues = {
  orderCode?: string;
  status?: "pending" | "paid" | "cancel";
  date?: moment.Moment;
};

interface OrderFilterProps {
  onFilter: (values: { orderCode?: string; status?: string; date?: string }) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ onFilter }) => {
  const [form] = Form.useForm<FilterValues>();

  const handleFinish = (values: FilterValues) => {
    const formattedValues = {
      ...values,
      date: values.date ? values.date.format("YYYY-MM-DD") : undefined,
    };
    onFilter(formattedValues);
  };

  return (
    <Form form={form} layout="inline" onFinish={handleFinish} className="mb-4">
      <Form.Item name="orderCode">
        <Input placeholder="Tìm theo mã đơn..." />
      </Form.Item>

      <Form.Item name="status">
        <Select placeholder="-- Lọc trạng thái --" allowClear style={{ minWidth: 150 }}>
          <Select.Option value="pending">Chờ thanh toán</Select.Option>
          <Select.Option value="paid">Đã thanh toán</Select.Option>
          <Select.Option value="cancel">Đã hủy</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="date">
        <DatePicker format="DD/MM/YYYY" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Lọc
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrderFilter;
