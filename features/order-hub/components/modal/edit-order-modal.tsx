"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Radio,
  Row,
  Col,
  Divider,
  Collapse,
  Spin,
} from "antd";
import {
  getDataFeeService,
  getDataProductFromLink,
  getRateOrder,
} from "../../apis/orderhub";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  DataFromLink,
  FeeServiceCheck,
  InsuranceOptionModel,
  OrderFeeRequest,
  OrderStatusType,
  RateOrderRequest,
  ServiceFee,
} from "@/types/orderhub";
import { getListProductCategory } from "@/features/fee-settting/apis/fee-setting";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";
import { useListInsurance } from "@/features/fee-settting/hooks/fee-setting";
import {
  useCreateNewOrder,
  useDetailOrder,
  useListService,
  useUpdateOrder,
} from "../../hooks/orderhub";
import { useListCustomerWithSearch } from "@/features/user-management/hooks/staff-manage";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faShield } from "@fortawesome/free-solid-svg-icons";
import TiptapEditor from "../TiptapEditor";
import { CURRENCY_CODE } from "./add-orderhub-modal";

const { Option } = Select;
const { Panel } = Collapse;
interface CreateOrderModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  orderId: number;
}
export default function EditOrderModal(props: CreateOrderModalProps) {
  const { t } = useTranslation();
  const { data: order, refetch } = useDetailOrder(props.orderId);

  const { isOpen, onCancel, orderId } = props;
  const [form] = Form.useForm();
  const [idProduct, setIdProduct] = React.useState<number | null>(null);
  const queryClient = useQueryClient();
  const updateOrderMutation = useUpdateOrder();
  const [rateValueForPrice, setRateValueForPrice] = useState<number>(0);

  const [routeId, setRouteId] = useState(0);

  const { data: listInsurance } = useListInsurance();
  const { data: listService } = useListService(
    { routeId: routeId },
    {
      enabled: routeId !== 0,
      queryKey: [],
    }
  );
  const [services, setServices] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<InsuranceOptionModel | null>(null);
  const [prices, setPrice] = useState<number>(0);
  const [percenDeposit, setPercenDeposit] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState("");
  const customer = Form.useWatch("customer", form);
  const priceVND = Form.useWatch("priceVnd", form);
  const priceY = Form.useWatch("priceY", form);
  const quantity = Form.useWatch("quantity", form);
  const category = Form.useWatch("category", form);
  const paymentAmount = Form.useWatch("paymentAmount", form);
  const paymentTypeForm = Form.useWatch("paymentType", form);
  const [paymentType, setPaymentType] = useState(1);
  const [rateProduct, setRateProduct] = useState(0);
  const [depositFee, setDepositFee] = useState(0);
  const [isCheckDisableInput, setIsCheckDisableInput] = useState(false);

  const currencyCheckCode = currencyCode === CURRENCY_CODE.JPY ? "¥" : "$";
  const itemQuantity= Form.useWatch("item_quantity", form);

  const [fees, setFees] = useState({
    DOMESTIC_SHIPPING_FEE: 0,
    INSURANCE_FEE: 0,
    MIN_DEPOSIT_PERCENT: 0,
    PAYMENT_FEE: 0,
    SERVICE_FEE: 0,
    SHIPPING_SURCHARGE_FEE: 0,
  });

  const handleOk = async () => {
    try {
      await form.validateFields();
      if (idProduct && insurance) {
        const serviceOptionTrue = listService
          .filter((item: any) => item.optional === true)
          .map((item: any) => item.code);
        const itemsPerUnit = form.getFieldValue("itemsPerUnit");
        const bodyNewOrder: OrderFeeRequest = {
          data: {
            product_id: idProduct,
            count: quantity,
            description: form.getFieldValue("description"),
            price: priceY,
            name: form.getFieldValue("productName"),
            item_quantity: form.getFieldValue("item_quantity"),
            ...(itemsPerUnit && { items_per_unit: itemsPerUnit }),
          },
          description: form.getFieldValue("note"),
          fee_codes: [...serviceOptionTrue, ...services],
          insurance_id: insurance?.id,
          user_id: customer,
          product_category_id: form.getFieldValue("category"),
          cod_shipping_price: paymentAmount ? paymentAmount : 0,
          cod_type: paymentTypeForm,
        };
        updateOrderMutation.mutate(
          {
            param: { ...bodyNewOrder },
            id: orderId,
          },
          {
            onSuccess: () => {
              toast.success("Cập nhật order mới thành công!");
              queryClient.invalidateQueries({
                queryKey: ["listorder"],
              });
              onCancel();
              form.resetFields();
            },
            onError: (err: any) =>
              toast.error(
                err.response?.data?.localizedMessage || t("common.error")
              ),
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const { mutate } = useMutation<DataFromLink, Error, string>({
    mutationFn: (link: string) => getDataProductFromLink(link),
  });
  const [searchValue, setSearchValue] = useState("");
  const { data, isLoading } = useListCustomerWithSearch({
    page: 0,
    page_size: 10,
    search: searchValue,
  });

  useEffect(() => {
    if (props.isOpen && orderId) {
      refetch();
    }
  }, [props.isOpen, refetch, orderId]);

  const { data: categories } = useQuery({
    queryKey: ["productCategories"],
    queryFn: getListProductCategory,
  });

  const handleServiceChange = (e: CheckboxChangeEvent, id: string) => {
    const checked = e.target.checked;
    setServices((prev) =>
      checked ? [...prev, id] : prev.filter((k) => k !== id)
    );
  };

  const handleInsuranceChange = (
    e: CheckboxChangeEvent,
    value: InsuranceOptionModel
  ) => {
    if (e.target.checked) setInsurance(value);
    else setInsurance(null);
  };

  useEffect(() => {
    const fetchRate = async () => {
      const customer = form.getFieldValue("customer");
      if (idProduct && customer) {
        try {
          const res = await getRateOrder({
            userId: customer,
            productId: idProduct,
          });
          form.setFieldValue(
            "priceVnd",
            +form.getFieldValue("priceY") * res.rate_to_vnd
          );
          setRateProduct(res.rate_to_vnd);
          setPrice(+form.getFieldValue("priceY") * res.rate_to_vnd);
        } catch (err) {
          console.error("Error fetching rate:", err);
        }
      }
    };

    fetchRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProduct, customer]);

  //   useEffect(()=>{
  //     form.setFieldValue("price",+priceY * rateProduct )
  //     setPrice(+form.getFieldValue("priceY") * rateProduct)
  //   },[priceY])

  useEffect(() => {
    const fetchFeeService = async () => {
      if (customer) {
        const serviceOptionTrue = listService
          .filter((item: any) => item.optional === true)
          .map((item: any) => item.code);
        const bodyGetFeeService: RateOrderRequest = {
          category_fee_id: category,
          fee_codes: [...services, ...serviceOptionTrue],
          price: priceY ? priceY : 0,
          user_id: form.getFieldValue("customer"),
          insurance_id: insurance ? insurance.id : 0,
          cod_in_japan: paymentAmount ? paymentAmount : 0,
          currency_code: currencyCode,
          quantity: quantity ? quantity : 0,
          route_id: routeId,
          item_quantity: itemQuantity ? itemQuantity : 0
        };
        try {
          const res: FeeServiceCheck = await getDataFeeService(
            bodyGetFeeService
          );
          setFees({
            DOMESTIC_SHIPPING_FEE: res.domestic_shipping_fee ?? 0,
            INSURANCE_FEE: res.insurance_fee ?? 0,
            MIN_DEPOSIT_PERCENT: res.min_deposit_percent ?? 0,
            PAYMENT_FEE: res.payment_fee ?? 0,
            SERVICE_FEE: res.service_fee ?? 0,
            SHIPPING_SURCHARGE_FEE: res.shipping_surcharge_fee ?? 0,
          });
          const feeY =
            res?.service_fee && rateProduct
              ? Math.ceil(res.service_fee / rateProduct)
              : 0;

          form.setFieldValue("feeY", feeY);
          setPercenDeposit(res.min_deposit_percent);
        } catch (error) {
          console.error("Error fetching fee service:", error);
        }
      }
    };

    fetchFeeService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form,
    services,
    customer,
    priceVND,
    prices,
    quantity,
    priceY,
    category,
    paymentAmount,
    itemQuantity,
  ]);

  useEffect(() => {
    if (listInsurance && listInsurance.length > 0) {
      setInsurance(listInsurance[0]);
    }
  }, [listInsurance]);

  // useEffect(() => {
  //   if (totalFee) form.setFieldValue("deposit", totalFee);
  // }, [totalFee, percenDeposit]);

  useEffect(() => {
    if (order && isOpen) {      
      setPrice(order.amount_vnd ?? 0);
      setIdProduct(order.metadata.items?.[0]?.product?.id ?? null);

      const services: string[] = [];
      order.metadata.infos?.fees?.forEach((item: any) => {
        if (item?.code) services.push(item.code);
      });
      setServices(services);
      setIsCheckDisableInput(order?.status !== OrderStatusType.PENDING_APPROVAL)
      setRouteId(order.metadata.items?.[0]?.product?.route_id ?? null);
      setRateValueForPrice(order.rate ?? 0);
      setCurrencyCode(
        order.metadata.items?.[0]?.product?.currency_code ?? "VND"
      );
      setPaymentType(order.metadata.infos?.codeType ?? 1);
      setInsurance(order.metadata.infos?.insurancePackage);
      setDepositFee(order?.deposit_fee ?? 0);
      form.setFieldsValue({
        link: order.metadata.items?.[0]?.product?.url ?? "",
        productName:
          order.metadata.items?.[0]?.product?.map_data?.productName ?? "",
        description:
          order.metadata.items?.[0]?.product?.map_data?.description ?? "",
        category: order.metadata.infos?.productCategory?.id ?? null,
        priceY: order.metadata.items?.[0]?.product?.map_data?.price ?? 0,
        priceVnd: order.amount_vnd ?? 0,
        customer: order.user_id ?? null,
        deposit: order.deposit_fee ?? 0,
        note: order.description ?? "",
        customerName: order.customer_name ?? "",
        quantity: order.metadata.items?.[0]?.count ?? 1,
        itemsPerUnit:
          order.metadata.items?.[0]?.product?.items_per_unit ?? null,
        paymentType: order.metadata.infos?.codeType ?? null,
        paymentAmount: order.metadata.infos?.codInJapan,
        item_quantity: order.metadata.items?.[0]?.item_quantity,
      });
    }
  }, [order, form, orderId]);

  const totalFeeCheck =
    fees.DOMESTIC_SHIPPING_FEE +
    fees.INSURANCE_FEE +
    fees.PAYMENT_FEE +
    fees.SERVICE_FEE +
    fees.SHIPPING_SURCHARGE_FEE -
    (paymentAmount ? paymentAmount : 0);
  const totalFee = ((totalFeeCheck + priceVND) * percenDeposit) / 100;

  const handleCancel = () => {
    form.resetFields();
    setServices([]);
    setInsurance(null);
    setPrice(0);
    setPercenDeposit(0);
    setIdProduct(null);
    setSearchValue("");
    setRateProduct(0);
    onCancel();
  };
  return (
    <>
      <Modal
        destroyOnClose
        styles={{
          body: {
            maxHeight: "74vh",
            overflowY: "auto",
            overflowX: "hidden",
          },
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Chỉnh sửa Đơn hàng
              </h3>
              <p className="text-sm text-gray-500">
                Cập nhật thông tin đơn hàng cho khách hàng
              </p>
            </div>
          </div>
        }
        open={isOpen}
        onCancel={handleCancel}
        centered
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              key="cancel"
              onClick={handleCancel}
              size="large"
              className="!h-11 !px-6"
            >
              Hủy bỏ
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                // if (order?.status !== OrderStatusType.PENDING_APPROVAL) {
                //   return;
                // }
                handleOk();
              }}
              size="large"
              className="!bg-gradient-to-r !from-blue-500 !to-blue-600 !h-11 !px-6 !border-0 hover:!from-blue-600 hover:!to-blue-700"
              // disabled={order?.status !== OrderStatusType.PENDING_APPROVAL}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ method: "buy" }}
          className="mt-6"
        >
          <Row gutter={24}>
            {/* Thông tin Sản phẩm */}
            <Col span={14}>
              {/* Product Information Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">
                    Thông tin Sản phẩm
                  </h4>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Link Sản phẩm
                      </span>
                    }
                    name="link"
                    rules={[{ required: true, message: "Vui lòng nhập link!" }]}
                    className="!mb-10 !h-11"
                  >
                    <Input
                      disabled={isCheckDisableInput}
                      placeholder="https://..."
                      prefix={
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      }
                      className="!h-11 !rounded-lg hover:!border-blue-400 focus:!border-blue-500"
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Tên Sản phẩm
                      </span>
                    }
                    name="productName"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên sản phẩm!",
                      },
                    ]}
                    className="!mb-4"
                  >
                    <Input
                      disabled={isCheckDisableInput}
                      className="!h-11 !rounded-lg hover:!border-blue-400 focus:!border-blue-500"
                      placeholder="Nhập tên sản phẩm"
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Mô tả Sản phẩm
                      </span>
                    }
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mô tả sản phẩm!",
                      },
                    ]}
                    className="!mb-4"
                  >
                    <TiptapEditor isDisable ={isCheckDisableInput} />
                  </Form.Item>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Loại sản phẩm
                          </span>
                        }
                        name="category"
                        rules={[
                          { required: true, message: "Chọn loại sản phẩm!" },
                        ]}
                        className="!mb-4 [&_.ant-form-item-explain]:!mt-2"
                      >
                        <Select
                          className="[&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!leading-[44px] [&_.ant-select-selector]:!rounded-lg"
                          placeholder="-- Chọn loại --"
                          suffixIcon={
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          }
                        >
                          {categories?.map((cat: any) => (
                            <Option key={cat.id} value={cat.id}>
                              {cat.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Số lượng
                          </span>
                        }
                        name="quantity"
                        className="!mb-4"
                      >
                        <InputNumber
                          disabled={isCheckDisableInput}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value: any) =>
                            value.replace(/\$\s?|(,*)/g, "")
                          }
                          className="!w-full !h-11 !rounded-lg"
                          placeholder="1"
                          min={1}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Số lượng sản phẩm/bộ
                            <span className="text-xs text-gray-500 ml-2">
                              (VD: 1 bộ kẹp tóc có 3 chiếc)
                            </span>
                          </span>
                        }
                        name="item_quantity"
                        className="!mb-4"
                      >
                        <InputNumber
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value: any) =>
                            value.replace(/\$\s?|(,*)/g, "")
                          }
                          prefix={
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          }
                          className="!w-full !h-11 !rounded-lg"
                          placeholder="Nhập số lượng sản phẩm trong 1 bộ (nếu có)"
                          min={1}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Giá ({currencyCheckCode}){" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        name="priceY"
                        className="!mb-4"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập giá sản phẩm!",
                          },
                        ]}
                      >
                        <InputNumber
                          disabled={isCheckDisableInput}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value: any) =>
                            value.replace(/\$\s?|(,*)/g, "")
                          }
                          prefix={
                            <span className="text-gray-400">
                              {currencyCheckCode}
                            </span>
                          }
                          className="!w-full !h-11 !rounded-lg"
                          onChange={(e) => {
                            form.setFieldValue(
                              "priceVnd",
                              +priceY * rateProduct
                            );
                          }}
                          min={0}
                          placeholder="0"
                        />
                      </Form.Item>
                      <Form.Item name="priceVnd" style={{ display: "none" }}>
                        <InputNumber />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Phí VC nội địa
                          </span>
                        }
                        name="paymentType"
                        className="!mb-4 [&_.ant-form-item-explain]:!mt-2"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn hình thức",
                          },
                        ]}
                      >
                        <Select
                          disabled={isCheckDisableInput}
                          placeholder="Chọn hình thức"
                          onChange={(value) => setPaymentType(value)}
                          options={[
                            { label: "Miễn phí", value: 1 },
                            { label: "Có phí", value: 2 },
                            { label: "Cập nhật sau", value: 3 },
                          ]}
                          className="[&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg"
                          suffixIcon={
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {paymentType === 2 && (
                    <Form.Item
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Số tiền thanh toán
                        </span>
                      }
                      name="paymentAmount"
                      className="!mb-4"
                      rules={[
                        { required: true, message: "Vui lòng nhập số tiền" },
                      ]}
                    >
                      <InputNumber
                        disabled={isCheckDisableInput}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value?.replace(/,/g, "") as any}
                        prefix={
                          <span className="text-gray-400">
                            {currencyCheckCode}
                          </span>
                        }
                        className="!w-full !h-11 !rounded-lg"
                        min={0}
                        placeholder="0"
                      />
                    </Form.Item>
                  )}

                  {/* Services Section */}
                  <div className="mt-4">
                    <Collapse
                      defaultActiveKey={["1"]}
                      className="!bg-gradient-to-br !from-blue-50 !to-blue-100 !rounded-lg !border-0 !shadow-sm"
                      expandIconPosition="end"
                    >
                      <Panel
                        key="1"
                        header={
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faCog}
                                className="text-white text-sm"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-blue-900 text-sm">
                                Dịch vụ bổ sung
                              </div>
                              <div className="text-xs text-blue-600">
                                Tùy chọn thêm
                              </div>
                            </div>
                          </div>
                        }
                        className="[&_.ant-collapse-header]:!py-3"
                      >
                        <div className="space-y-2">
                          {listService?.map((item: ServiceFee) => {
                            if (item.optional) return null;                            
                            const isChecked = services.includes(item.code);
                            return (
                              <div
                                key={item.id}
                                className={`flex items-start justify-between bg-white rounded-lg p-3 border-2 transition-all ${
                                  isChecked
                                    ? "border-blue-400 shadow-md"
                                    : "border-gray-200 hover:border-blue-200"
                                }`}
                              >
                                <div className="flex-1 pr-3">
                                  <Checkbox
                                    disabled={isCheckDisableInput}
                                    checked={isChecked}
                                    onChange={(e) =>
                                      handleServiceChange(e, item.code)
                                    }
                                    className="
                                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-blue-500
                                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-blue-500
                                    [&_.ant-checkbox-disabled.ant-checkbox-checked_.ant-checkbox-inner]:!bg-blue-500
                                    [&_.ant-checkbox-disabled.ant-checkbox-checked_.ant-checkbox-inner]:!border-blue-500
                                    [&_.ant-checkbox-disabled.ant-checkbox-checked_.ant-checkbox-inner::after]:!border-white
                                  "                                  >
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">
                                        {item.name}
                                      </div>
                                      <div className="text-gray-500 text-xs mt-0.5">
                                        {item.description}
                                      </div>
                                    </div>
                                  </Checkbox>
                                </div>
                                <div className="text-blue-600 font-semibold text-sm whitespace-nowrap">
                                  {item.amount ? item.amount.toLocaleString("en-US"): 0} {item.currency_code === "VND" ? "đ" : item.currency_code}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    </Collapse>
                  </div>

                  {/* Insurance Section */}
                  <div className="mt-3">
                    <Collapse
                      defaultActiveKey={["2"]}
                      className="!bg-gradient-to-br !from-amber-50 !to-amber-100 !rounded-lg !border-0 !shadow-sm"
                      expandIconPosition="end"
                    >
                      <Panel
                        key="2"
                        header={
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faShield}
                                className="text-white text-sm"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-amber-900 text-sm">
                                Bảo hiểm đơn hàng
                              </div>
                              <div className="text-xs text-amber-600">
                                Bảo vệ đơn hàng của bạn
                              </div>
                            </div>
                          </div>
                        }
                        className="[&_.ant-collapse-header]:!py-3"
                      >
                        <div className="space-y-2">
                          {listInsurance?.map((item: InsuranceOptionModel) => {
                            const isChecked = insurance?.id === item.id;
                            return (
                              <div
                                key={item.id}
                                className={`flex items-start justify-between bg-white rounded-lg p-3 border-2 transition-all ${
                                  isChecked
                                    ? "border-amber-400 shadow-md"
                                    : "border-gray-200 hover:border-amber-200"
                                }`}
                              >
                                <div className="flex-1 pr-3">
                                  <Checkbox
                                    disabled={isCheckDisableInput}
                                    checked={isChecked}
                                    onChange={(e) =>
                                      handleInsuranceChange(e, item)
                                    }
                                    className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-amber-500"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">
                                        {item.name}
                                      </div>
                                      <div className="text-gray-500 text-xs mt-0.5">
                                        {item.description}
                                      </div>
                                    </div>
                                  </Checkbox>
                                </div>
                                <div className="text-amber-600 font-semibold text-sm whitespace-nowrap">
                                  {item.fee_percentage ?? 0}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={10}>
              {/* Order Information Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">
                    Thông tin Đơn hàng
                  </h4>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <Form.Item name="customer" style={{ display: "none" }}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Khách hàng
                      </span>
                    }
                    name="customerName"
                    className="!mb-4"
                    rules={[
                      { required: true, message: "Vui lòng chọn khách hàng!" },
                    ]}
                  >
                    <Input
                      prefix={
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      }
                      className="!h-11 !rounded-lg !bg-gray-50"
                      disabled
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Phí dịch vụ ({currencyCheckCode})
                      </span>
                    }
                    name="feeY"
                    className="!mb-4"
                  >
                    <InputNumber
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      prefix={
                        <span className="text-gray-400">
                          {currencyCheckCode}
                        </span>
                      }
                      className="!w-full !h-11 !rounded-lg !bg-gray-50"
                      disabled
                      placeholder="Tự động tính"
                    />
                  </Form.Item>
                  <Form.Item name="feeVnd" style={{ display: "none" }}>
                    <InputNumber />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Ghi chú
                      </span>
                    }
                    name="note"
                    className="!mb-0"
                  >
                    <Input.TextArea
                      disabled={isCheckDisableInput}
                      rows={3}
                      className="!rounded-lg hover:!border-blue-400 focus:!border-blue-500"
                      placeholder="Ghi chú thêm về đơn hàng..."
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <h4 className="font-semibold text-white">
                    {t("form.orderSummary")}
                  </h4>
                </div>

                <div className="p-4 space-y-2.5">
                  {/* Exchange Rate */}
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                        />
                      </svg>
                      Tỷ giá quy đổi
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {rateValueForPrice
                        ? rateValueForPrice.toLocaleString("en-US")
                        : 0}{" "}
                      đ
                    </span>
                  </div>

                  {/* Product Price */}
                  <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm text-blue-700 font-medium">
                      {t("form.productPrice")}
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      {priceY && quantity
                        ? (priceY * quantity).toLocaleString("en-US")
                        : 0}{" "}
                      {currencyCheckCode}
                    </span>
                  </div>

                  {/* Domestic Shipping */}
                  {paymentAmount > 0 && (
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-600">
                        Cước VC nội địa
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paymentAmount.toLocaleString("en-US")}{" "}
                        {currencyCheckCode}
                      </span>
                    </div>
                  )}

                  {/* Fees Section */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Chi phí
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          {t("form.serviceFee")}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.SERVICE_FEE.toLocaleString("en-US")} đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Phí thanh toán
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.PAYMENT_FEE.toLocaleString("en-US")} đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Cước VC quốc tế
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.DOMESTIC_SHIPPING_FEE.toLocaleString("en-US")} đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Phụ thu VC
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.SHIPPING_SURCHARGE_FEE.toLocaleString("en-US")}{" "}
                          đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Phí bảo hiểm
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.INSURANCE_FEE.toLocaleString("en-US")} đ
                        </span>
                      </div>

                      {/* Additional Services */}
                      {listService?.map(
                        (item: any) =>
                          services.includes(item.code) && (
                            <div
                              key={item.code}
                              className="flex justify-between items-center py-1.5 px-3 bg-white rounded"
                            >
                              <span className="text-sm text-gray-600">
                                {item.name}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {item.amount.toLocaleString("en-US")} đ
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-3 pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md">
                      <span className="text-base font-bold text-white">
                        {t("form.total")}:
                      </span>
                      <span className="text-lg font-bold text-white">
                        {totalFeeCheck
                          ? (
                              totalFeeCheck +
                              priceVND * (quantity ?? 0)
                            ).toLocaleString("en-US")
                          : 0}{" "}
                        đ
                      </span>
                    </div>
                  </div>

                  {/* Deposit */}
                  <div className="flex justify-between items-center py-2.5 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <span className="text-sm font-semibold text-green-700 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {t("form.deposit")}:
                    </span>
                    <span className="text-base font-bold text-green-700">
                      {depositFee.toLocaleString("en-US")} đ
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
