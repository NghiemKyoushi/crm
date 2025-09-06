"use client";
import React from "react";
import { Button, Input, Select, DatePicker, Form, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const { Option } = Select;

interface FilterSectionProps {
  onFilter: (value: any) => void;
}
const FilterSection = (props: FilterSectionProps) => {
  const { onFilter } = props;
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      date: values.date ? values.date.format("YYYY-MM-DD") : undefined,
    };

    try {
      toast.success("Gửi request lọc thành công!");
    } catch (err) {
      toast.error("Có lỗi khi gọi API");
    }
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
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="canceled">Đã hủy</Option>
              <Option value="manual">Nạp tay</Option>
            </Select>
          </Form.Item>

          <Form.Item name="date" className="mb-0">
            <DatePicker placeholder="Chọn ngày" className="w-full h-11" />
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
