"use client";
import React, { useEffect } from "react";
import { Button, Select, DatePicker, Form, Input } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { DepositParams } from "@/types/deposit-type";
import { useTranslation } from "react-i18next";
const { RangePicker } = DatePicker;

const { Option } = Select;

interface FilterSectionProps {
  onFilter: (value: any) => void;
  code?: string;
  action?: string;
}

const FilterSection = (props: FilterSectionProps) => {
  const { onFilter, code, action } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const onFinish = async (values: any) => {  
    const payload: DepositParams = {
      ...values,
      from_date: values.dateRange?.[0]?.format("YYYY-MM-DD"),
      to_date: values.dateRange?.[1]?.format("YYYY-MM-DD"),
      status: values.status,
      deposit_code: values.keyword,
      handler: values.handler, // add handler to payload
    };    
    onFilter(payload);
  };

  useEffect(() => {
    if (code && action === "deposit") {
      form.setFieldsValue({ keyword: code });
      form.submit(); // sẽ trigger onFinish với giá trị đã có
    }
  }, [code, form]);

  return (
    <div className="flex flex-col mb-4 gap-4">
      <Form form={form} onFinish={onFinish}>
        {/* Sử dụng grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] để ô button nhỏ lại */}
        <div className="w-full grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-center bg-gray-50 rounded-lg p-4 border border-gray-200">
          <Form.Item name="keyword" className="mb-0">
            <Input placeholder={t("keywordPlaceholder")} className="w-full h-11" />
          </Form.Item>

          {/* New field: handler (người xử lý) */}
          <Form.Item name="handler" className="mb-0">
            <Input placeholder={t("deposit.handlerPlaceholder") || "Người xử lý"} className="w-full h-11" />
          </Form.Item>

          <Form.Item name="status" className="mb-0">
            <Select allowClear placeholder={t("statusPlaceholder")} className="w-full !h-11">
              <Option value="WAITING_CONFIRMATION">{t("status.waiting")}</Option>
              <Option value="COMPLETED">{t("status.completed")}</Option>
              <Option value="CANCELED">{t("status.canceled")}</Option>
              <Option value="FAILED">{t("status.failed")}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" className="mb-0">
            <RangePicker
              placeholder={[t("fromDate"), t("toDate")]}
              className="w-full h-11"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              icon={<FilterOutlined />}
              className="min-w-[90px] !px-3 !bg-gray-700 !text-white !font-medium !h-11 !text-sm"
              // px-3: padding nhỏ, min-w-[40px]: khoá tối thiểu không bị quá nhỏ
            >
              {t("filter")}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default FilterSection;
