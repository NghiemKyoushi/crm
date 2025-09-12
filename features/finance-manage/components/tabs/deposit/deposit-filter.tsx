"use client";
import React, { useEffect } from "react";
import { Button, Select, DatePicker, Form, SelectProps, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { DepositParams } from "@/types/deposit-type";
import { useTranslation } from "react-i18next";
const { RangePicker } = DatePicker;

const { Option } = Select;

interface FilterSectionProps {
  onFilter: (value: any) => void;
  code?: string;
}
const FilterSection = (props: FilterSectionProps) => {
  const { onFilter, code } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const onFinish = async (values: any) => {  
    const payload: DepositParams = {
      ...values,
      fromDate: values.dateRange?.[0]?.format("YYYY-MM-DD"),
      toDate: values.dateRange?.[1]?.format("YYYY-MM-DD"),
      status: values.status,
      depositCode: values.keyword,
    };
    onFilter(payload);
  };

   useEffect(() => {
    if (code) {
      form.setFieldsValue({ keyword: code });
      form.submit(); // sẽ trigger onFinish với giá trị đã có
    }
  }, [code, form]);

  return (
    <div className="flex flex-col mb-2 gap-4 ">
      <Form form={form} onFinish={onFinish}>
        <div className="w-full grid grid-cols-4 gap-3 items-center bg-white rounded-lg">
          <Form.Item name="keyword" className="mb-0">
          <Input placeholder={t("keywordPlaceholder")} className="w-full h-11" />
          </Form.Item>

          <Form.Item name="status" className="mb-0">
            <Select placeholder={t("statusPlaceholder")} className="w-full !h-11">
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
              icon={<FontAwesomeIcon icon={faFilter} />}
              className="w-full  !bg-gray-700 !text-white !font-medium !h-11 !text-base"
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
