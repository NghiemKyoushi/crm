"use client";

import React from "react";
import { Form, Input, Select, DatePicker, Button } from "antd";
import moment from "moment";
import { useTranslation } from "react-i18next";

type FilterValues = {
  orderCode?: string;
  status?: "pending" | "paid" | "cancel";
  date?: moment.Moment;
};

interface OrderFilterProps {
  onFilter: (values: { orderCode?: string; status?: string; date?: string }) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ onFilter }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FilterValues>();

  const handleFinish = (values: FilterValues) => {
    const formattedValues = {
      ...values,
      date: values.date ? values.date.format("YYYY-MM-DD") : undefined,
    };
    onFilter(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className="mb-4 w-full flex flex-row gap-3"
      style={{ width: "100%" }}
    >
      <Form.Item name="orderCode" style={{ width: "100%" }} >
        <Input placeholder={t('placeholder.searchByOrderCode')} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="status" style={{ width: "100%" }}>
        <Select
          placeholder={t('placeholder.filterStatus')}
          allowClear
          style={{ width: "100%" }}
        >
          <Select.Option value="pending">{t('status.pendingPayment')}</Select.Option>
          <Select.Option value="paid">{t('status.paid')}</Select.Option>
          <Select.Option value="cancel">{t('status.cancelled')}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="date" style={{ width: "100%" }} >
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item style={{ width: "100%" }}>
        <Button type="primary" htmlType="submit" block>
          {t('button.filter')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrderFilter;
