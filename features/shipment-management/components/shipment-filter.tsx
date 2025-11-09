"use client";
import React from "react";
import { Button, Input, Select, Form, DatePicker, InputNumber } from "antd";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { OrderStatusType } from "@/types/orderhub";

export interface FilterTypeShipment {
  page?: number;
  search?: string;
  status?: string[]; // Multi-search
  date?: string;
  type?: number;
  size?: number;
  // New search fields
  from_date?: string;
  to_date?: string;
  customer_name?: string;
  product_url?: string;
  product_name?: string;
  invoice_no?: string;
  tracking_code?: string;
  package_code?: string;
  product_id?: string;
  note_admin?: string;
  tracking_ship?: string;
  email?: string;
  phone_number?: number;
  customer_code?: string;
}

interface ShipmentFilterProps {
  onFilter: (filters: FilterTypeShipment) => void;
  initialFilters?: FilterTypeShipment;
}

export default function ShipmentFilter({
  onFilter,
  initialFilters,
}: ShipmentFilterProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;

  const orderStatusOptions = [
    {
      value: OrderStatusType.ARRIVED_VN_WAREHOUSE,
      label: t("status.arrivedVnWarehouse"),
    },
    { value: OrderStatusType.READY_TO_SHIP, label: t("status.readyToShip") },
    { value: OrderStatusType.SHIPPED, label: t("status.shipped") },
    {
      value: OrderStatusType.SHIPPING_REQUEST_CLIENT,
      label: t("status.shippingRequest"),
    },
    {
      value: OrderStatusType.PACKED,
      label: t("status.packed"),
    },
  ];

  const handleFinish = (values: any) => {
    let fromDate: string | undefined;
    let toDate: string | undefined;
    if (values.date && Array.isArray(values.date) && values.date.length === 2) {
      fromDate = values.date[0]
        ? values.date[0].format("YYYY-MM-DD")
        : undefined;
      toDate = values.date[1] ? values.date[1].format("YYYY-MM-DD") : undefined;
    }

    const filters: FilterTypeShipment = {
      search:
        values.keyword && values.keyword.trim() !== ""
          ? values.keyword
          : undefined,
      status: Array.isArray(values.status) && values.status.length > 0
        ? values.status.filter((s: string) => s && s !== "")
        : undefined,
      date: values.date ? values.date.format?.("YYYY-MM-DD") : undefined,
      type: initialFilters?.type || undefined,
      customer_name: values.customer_name?.trim() || undefined,
      product_url: values.product_url?.trim() || undefined,
      product_name: values.product_name?.trim() || undefined,
      tracking_ship: values.tracking_ship?.trim() || undefined,
      tracking_code: values.tracking_code?.trim() || undefined,
      package_code: values.package_code?.trim() || undefined,
      product_id: values.product_id?.trim() || undefined,
      note_admin: values.note_admin?.trim() || undefined,
      from_date: fromDate,
      to_date: toDate,
      phone_number: values.phone_number || undefined,
      customer_code: values.customer_code?.trim() || undefined,
      email: values.email?.trim() || undefined,
      invoice_no: values.invoice_no?.trim() || undefined,
    };    
    onFilter(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({
      search: undefined,
      status: undefined,
      date: undefined,
      type: initialFilters?.type || undefined,
      customer_name: undefined,
      product_url: undefined,
      product_name: undefined,
      tracking_ship: undefined,
      tracking_code: undefined,
      package_code: undefined,
      product_id: undefined,
      note_admin: undefined,
      from_date: undefined,
      to_date: undefined,
      email: undefined,
      phone_number: undefined,
      customer_code: undefined,
      invoice_no: undefined,
    });
  };

  // Use as is for initial value for multi-select
  const selectInitialValues = {
    ...initialFilters,
    status:
      initialFilters && Array.isArray(initialFilters.status)
        ? initialFilters.status
        : undefined,
  };

  return (
    <div className="flex flex-col mb-2 gap-1">
      <Form
        form={form}
        onFinish={handleFinish}
        initialValues={selectInitialValues}
      >
        {/* Action Buttons Row */}
        <div className="w-full flex justify-end gap-3 bg-white rounded-lg p-2">
          <Button
            type="default"
            onClick={handleReset}
            className="!h-10 !text-gray-600 !font-medium !text-xs !px-6"
            size="small"
          >
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<FontAwesomeIcon icon={faFilter} className="text-xs" />}
            className="!h-10 !bg-gray-700 !text-white !font-medium !text-xs !px-6"
            size="small"
          >
            {t("filter")}
          </Button>
        </div>
        {/* Advanced Search Row */}
        <div className="w-full bg-gray-50 rounded-lg p-4">
          <div className="text-base font-semibold text-black-700 mb-2">
            Tìm kiếm
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cột 1: Thông tin khách hàng */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">
                Thông tin khách hàng
              </div>
              <Form.Item name="email" className="!mb-2">
                <Input
                  placeholder="Email"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="customer_code" className="!mb-2">
                <Input
                  placeholder="Mã khách hàng"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="phone_number" className="!mb-2">
                <InputNumber
                  placeholder="Số điện thoại"
                  className="!w-full !h-10 !text-xs placeholder:!flex placeholder:!items-center placeholder:!h-full"
                  size="small"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, "")
                  }
                  style={{ display: 'flex', alignItems: 'center' }}
                  inputMode="tel"
                />
              </Form.Item>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">
                Trạng thái
              </div>
              <Form.Item name="status" className="!mb-2">
                <Select
                  mode="multiple"
                  className="!w-full !text-xs [&_.ant-select-selection-placeholder]:!text-xs 
                    [&_.ant-select-selection-item]:!text-xs 
                    [&_.ant-select-selection-overflow]:!flex-wrap [&_.ant-select-selection-item]:!break-normal
                    [&_.ant-select-selector]:!min-h-[40px]"
                  placeholder={<span className="text-xs">Trạng thái</span>}
                  size="small"
                  allowClear
                  optionLabelProp="label"
                  dropdownStyle={{ maxWidth: 350, whiteSpace: 'normal' }}
                  tokenSeparators={[","]}
                >
                  {orderStatusOptions.map((opt) => (
                    <Select.Option
                      className="text-xs !whitespace-normal !break-words"
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                    >
                      <span className="!whitespace-normal !break-words">{opt.label}</span>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            {/* Cột 2: Mã vận đơn & Tracking */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">
                Mã xuất kho & Tracking
              </div>
              <div className="flex flex-col gap-2">
                <Form.Item name="tracking_ship" className="!mb-0">
                  <Input
                    placeholder="Mã xuất kho"
                    className="!w-full !h-10 !text-xs"
                    size="small"
                  />
                </Form.Item>
                <Form.Item name="tracking_code" className="!mb-0">
                  <Input
                    placeholder="Mã tracking"
                    className="!w-full !h-10 !text-xs"
                    size="small"
                  />
                </Form.Item>
                <Form.Item name="invoice_no" className="!mb-0">
                  <Input
                    placeholder="Mã đơn hàng"
                    className="!w-full !h-10 !text-xs"
                    size="small"
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
