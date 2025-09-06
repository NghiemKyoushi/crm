"use client";
import React, { useEffect, useState } from "react";
import { Button, Select, DatePicker, Form, SelectProps, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { DepositParams } from "@/types/deposit-type";
import { useListCustomer } from "@/features/user-management/hooks/staff-manage";
const { RangePicker } = DatePicker;

const { Option } = Select;

interface FilterSectionProps {
  onFilter: (value: any) => void;
}
const FilterSection = (props: FilterSectionProps) => {
  const { onFilter } = props;
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [options, setOptions] = useState<SelectProps["options"]>([]);

  const { data } = useListCustomer({
    page,
    page_size: 10,
    category_id: undefined,
    search: search || undefined,
  });

  useEffect(() => {
    if (data?.data) {
      setOptions(
        data.data.map((user: any) => ({
          value: user.user_id,
          label: `${user.full_name}`,
        }))
      );
    }
  }, [data]);

  const onFinish = async (values: any) => {  
    const payload: DepositParams = {
      ...values,
      fromDate: values.dateRange?.[0]?.format("YYYY-MM-DD"),
      toDate: values.dateRange?.[1]?.format("YYYY-MM-DD"),
      status: values.status,
    };
  
    onFilter(payload);
  };

  return (
    <div className="flex flex-col mb-2 gap-4 ">
      <Form form={form} onFinish={onFinish}>
        <div className="w-full grid grid-cols-4 gap-3 items-center bg-white rounded-lg">
          <Form.Item name="keyword" className="mb-0">
          <Input placeholder="Mã lệnh, Mã KH..." className="w-full h-11" />
          </Form.Item>

          <Form.Item name="status" className="mb-0">
            <Select placeholder="-- Trạng thái --" className="w-full !h-11">
              <Option value="WAITING_CONFIRMATION">Chờ xác nhận</Option>
              <Option value="COMPLETED">Đã xác nhận</Option>
              <Option value="CANCELED">Đã hủy</Option>
              <Option value="FAILED">Thất bại</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" className="mb-0">
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
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
              Lọc
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default FilterSection;
