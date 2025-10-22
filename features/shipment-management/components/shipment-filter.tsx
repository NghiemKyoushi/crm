"use client";
import React from "react";
import { Button, Input, Select, Form, DatePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { OrderStatusType } from "@/types/orderhub";

export interface FilterTypeShipment {
  page?: number;
  search?: string;
  status?: string[]; // Kiểu dữ liệu status vẫn là array string
  date?: string;
  fromdate?: string;
  todate?: string;
  type?: number;
  size?: number;
  // New search fields
  fromDate?: string;
  toDate?: string;
  customer_name?: string;
  customer_code?: string;
  product_url?: string;
  product_name?: string;
  invoice_no?: string;
  tracking_code?: string;
  package_code?: string;
  product_id?: string;
  note_admin?: string;
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
      value: OrderStatusType.ARRIVED_VN_WAREHOUSE, //
      label: t("status.arrivedVnWarehouse"),
    },
    { value: OrderStatusType.READY_TO_SHIP, label: t("status.readyToShip") }, //
    { value: OrderStatusType.SHIPPED, label: t("status.shipped") }, //
    {
      value: OrderStatusType.SHIPPING_REQUEST_CLIENT, //
      label: t("status.shippingRequest"),
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
      status: values.status
        ? [values.status].filter((s: string) => s && s !== "")
        : undefined,
      date: values.date ? values.date.format?.("YYYY-MM-DD") : undefined,
      type: initialFilters?.type || undefined,
      // New search fields
      customer_name: values.customer_name?.trim() || undefined,
      customer_code: values.customer_code?.trim() || undefined,
      product_url: values.product_url?.trim() || undefined,
      product_name: values.product_name?.trim() || undefined,
      invoice_no: values.invoice_no?.trim() || undefined,
      tracking_code: values.tracking_code?.trim() || undefined,
      package_code: values.package_code?.trim() || undefined,
      product_id: values.product_id?.trim() || undefined,
      note_admin: values.note_admin?.trim() || undefined,
      fromDate,
      toDate,
    };
    console.log("filters", filters);

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
      customer_code: undefined,
      product_url: undefined,
      product_name: undefined,
      invoice_no: undefined,
      tracking_code: undefined,
      package_code: undefined,
      product_id: undefined,
      note_admin: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
  };

  // If initialFilters.status is string[], convert to a single value (first element) for Select initial value
  const selectInitialValues = {
    ...initialFilters,
    status:
      initialFilters &&
      Array.isArray(initialFilters.status) &&
      initialFilters.status.length > 0
        ? initialFilters.status[0]
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
          <div className="text-base  font-semibold text-black-700 mb-2">
            Tìm kiếm
          </div>
          <div className="grid grid-cols-4 gap-3">
            {/* Customer Info */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">
                Thông tin khách hàng
              </div>
              <Form.Item name="customer_name" className="!mb-2">
                <Input
                  placeholder="Tên khách hàng"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="customer_code" className="!mb-0">
                <Input
                  placeholder="Mã khách hàng"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
            </div>

            {/* Product Info */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">
                Thông tin sản phẩm
              </div>
              <Form.Item name="product_name" className="!mb-2">
                <Input
                  placeholder="Tên sản phẩm"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="product_url" className="!mb-2">
                <Input
                  placeholder="Link sản phẩm"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="product_id" className="!mb-0">
                <Input
                  placeholder="Mã sản phẩm"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
            </div>

            {/* Order & Tracking Info */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">
                Mã đơn hàng & Tracking
              </div>
              <Form.Item name="invoice_no" className="!mb-2">
                <Input
                  placeholder="Mã đơn hàng"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="tracking_code" className="!mb-2">
                <Input
                  placeholder="Mã tracking"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="package_code" className="!mb-0">
                <Input
                  placeholder="Mã kiện"
                  className="!w-full !h-10 !text-xs"
                  size="small"
                />
              </Form.Item>
            </div>

            {/* Status, Date & Notes */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">
                Trạng thái & Ghi chú
              </div>
              <Form.Item name="status" className="!mb-2">
                <Select
                  className="!w-full !h-10 !text-xs [&_.ant-select-selection-placeholder]:!text-xs [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-selected-value]:!text-xs"
                  placeholder={<span className="text-xs">Trạng thái</span>}
                  size="small"
                  allowClear
                  mode={undefined} // Không dùng "multiple" mode => chỉ cho chọn 1 trạng thái
                >
                  {orderStatusOptions.map((opt) => (
                    <Select.Option
                      className="text-xs"
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="date" className="!mb-2">
                <RangePicker
                  placeholder={[t("fromDate"), t("toDate")]}
                  className="!w-full !h-10 [&_.ant-picker-input>input]:!h-10 [&_.ant-picker-input>input]:!text-xs"
                  format="YYYY-MM-DD"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="note_admin" className="!mb-0">
                <Input.TextArea
                  placeholder="Ghi chú admin"
                  className="!w-full !text-xs !h-10"
                  rows={2}
                  size="small"
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
