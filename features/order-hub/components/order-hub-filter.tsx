"use client";
import React, { useEffect, useRef } from "react";
import { Button, Input, Select, Form, DatePicker, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { OrderStatusType } from "@/types/orderhub";

// Lấy hook lấy params từ URL
import { useSearchParams } from "next/navigation";

export interface FilterType {
  page?: number;
  status?: string[];
  date?: string;
  type?: number;
  size?: number;
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
  email?: string;
  phone_number?: number;
  customer_code?: string;
  account?: string;
}

interface OrderHubFilterProps {
  onFilter: (filters: FilterType) => void;
  onCreateOrder: () => void;
  initialFilters?: FilterType;
  canCreate?: boolean;
}

export default function OrderHubFilter({
  onFilter,
  onCreateOrder,
  initialFilters,
  canCreate = true,
}: OrderHubFilterProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;

  // Lấy params từ url
  const searchParams = useSearchParams();
  const invoiceNoQuery = searchParams.get("invoice_no");

  // Ref để chỉ set invoice_no từ URL duy nhất lần đầu, sau đó form tự quản lý
  const didInitByQuery = useRef(false);

  useEffect(() => {
    if (invoiceNoQuery && !didInitByQuery.current) {
      // Nếu form chưa được khởi tạo bởi query, set giá trị vào form
      if (form.getFieldValue("invoice_no") !== invoiceNoQuery) {
        form.setFieldsValue({
          ...initialFilters,
          invoice_no: invoiceNoQuery,
        });
      }
      // Gọi filter với invoice_no, merge các giá trị đang có
      onFilter({
        ...initialFilters,
        invoice_no: invoiceNoQuery,
      });
      didInitByQuery.current = true;
    }
    // eslint-disable-next-line
  }, [invoiceNoQuery]);

  const orderStatusOptions = [
    {
      value: OrderStatusType.PENDING_APPROVAL,
      label: t("status.pendingApproval"),
    },
    {
      value: OrderStatusType.PENDING_DEPOSIT,
      label: t("status.pendingDeposit"),
    },
    { value: OrderStatusType.DEPOSIT_PAID, label: t("status.depositPaid") },
    { value: OrderStatusType.PURCHASED, label: t("status.purchased") },
    {
      value: OrderStatusType.ARRIVED_JP_WAREHOUSE,
      label: t("status.arrivedJpWarehouse"),
    },
    {
      value: OrderStatusType.ARRIVED_VN_WAREHOUSE,
      label: t("status.arrivedVnWarehouse"),
    },
    // {
    //   value: OrderStatusType.UNDER_INSPECTION,
    //   label: t("status.underInspection"),
    // },
    {
      value: OrderStatusType.PENDING_PAYMENT,
      label: t("status.pendingPayment"),
    },
    { value: OrderStatusType.READY_TO_SHIP, label: t("status.readyToShip") },
    { value: OrderStatusType.SHIPPED, label: t("status.shipped") },
    {
      value: OrderStatusType.SHIPPING_REQUEST_CLIENT,
      label: t("status.shippingRequest"),
    },
    { value: OrderStatusType.CANCELED, label: t("status.canceled") },
    { value: OrderStatusType.DENIED, label: t("status.denied") },
  ];

  const handleFinish = (values: any) => {
    // Xử lý lấy fromDate và toDate từ trường "date"
    let fromDate: string | undefined;
    let toDate: string | undefined;
    if (values.date && Array.isArray(values.date) && values.date.length === 2) {
      fromDate = values.date[0]
        ? values.date[0].format("YYYY-MM-DD")
        : undefined;
      toDate = values.date[1] ? values.date[1].format("YYYY-MM-DD") : undefined;
    }

    // Giá trị invoice_no lấy trực tiếp từ form (có thể bị xóa lúc search mới)
    const invoice_no_final = values.invoice_no?.trim() ?? undefined;

    const filters: FilterType = {
      status: Array.isArray(values.status) && values.status.length > 0 ? values.status : undefined,
      type: initialFilters?.type || undefined,
      customer_name: values.customer_name?.trim() || undefined,
      customer_code: values.customer_code?.trim() || undefined,
      product_url: values.product_url?.trim() || undefined,
      product_name: values.product_name?.trim() || undefined,
      invoice_no: invoice_no_final,
      tracking_code: values.tracking_code?.trim() || undefined,
      package_code: values.package_code?.trim() || undefined,
      product_id: values.product_id?.trim() || undefined,
      note_admin: values.note_admin?.trim() || undefined,
      email: values.email?.trim() || undefined,
      from_date: fromDate,
      to_date: toDate,
      phone_number: values.phone_number || undefined,
      account: values.account || undefined,
    };
    onFilter(filters);
  };

  const handleReset = () => {
    form.resetFields();
    // Sau khi reset, invoice_no sẽ lấy giá trị rỗng (không còn giữ cố định theo query)
    const filterToPass: FilterType = {
      status: undefined,
      date: undefined,
      type: initialFilters?.type || undefined,
      customer_name: undefined,
      product_url: undefined,
      product_name: undefined,
      invoice_no: undefined,
      tracking_code: undefined,
      package_code: undefined,
      product_id: undefined,
      note_admin: undefined,
      from_date: undefined,
      to_date: undefined,
      customer_code: undefined,
      account: undefined
    };
    onFilter(filterToPass);
  };

  // initialValues: invoice_no chỉ lấy từ query lần đầu load, không cố định theo param nữa
  const mergedInitialValues = {
    ...initialFilters,
    ...(invoiceNoQuery && !didInitByQuery.current ? { invoice_no: invoiceNoQuery } : {}),
  };

  return (
    <div className="flex flex-col mb-2 gap-1">
      <Form form={form} onFinish={handleFinish} initialValues={mergedInitialValues}>
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
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined className="text-xs" />}
              className="!h-10 !bg-blue-600 !text-white !font-medium !text-xs !px-6"
              size="small"
              onClick={onCreateOrder}
            >
              Tạo đơn
            </Button>
          )}
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
              <Form.Item name="customer_name" className="!mb-2">
                <Input
                  placeholder="Tên khách hàng"
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
              <Form.Item name="account" className="!mb-2">
                <Input
                  placeholder="Account"
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
              <Form.Item name="date" className="!mb-2">
                <RangePicker
                  placeholder={[t("fromDate"), t("toDate")]}
                  className="!w-full !h-10 [&_.ant-picker-input>input]:!h-10 [&_.ant-picker-input>input]:!text-xs"
                  format="YYYY-MM-DD"
                  size="small"
                />
              </Form.Item>
              <Form.Item name="note_admin">
                <Input.TextArea
                  placeholder="Ghi chú admin"
                  className="!w-full !text-xs !h-10 flex items-center pl-3 placeholder:text-left"
                  rows={2}
                  size="small"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "left",
                  }}
                />
              </Form.Item>
            
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
