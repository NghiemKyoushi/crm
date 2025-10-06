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
import TextArea from "antd/es/input/TextArea";
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
  const currencyCheckCode = currencyCode === CURRENCY_CODE.JPY ? "¥" : "$";

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
        const bodyNewOrder: OrderFeeRequest = {
          data: {
            product_id: idProduct,
            count: quantity,
            description: form.getFieldValue("description"),
            price: priceY,
            name: form.getFieldValue("productName"),
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
    if (props.isOpen) {
      refetch();
    }
  }, [props.isOpen, refetch]);

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
          form.setFieldValue("feeY", Math.ceil(res.service_fee / rateProduct));
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
    if (order !== undefined && isOpen) {
      setPrice(order.amount_vnd ?? 0);
      setIdProduct(order.metadata.items?.[0]?.product?.id ?? null);

      const services: string[] = [];
      order.metadata.infos?.fees?.forEach((item: any) => {
        if (item?.code) services.push(item.code);
      });

      setRouteId(order.metadata.items?.[0]?.product?.route_id ?? null);
      setRateValueForPrice(order.rate ?? 0);
      setCurrencyCode(
        order.metadata.items?.[0]?.product?.currency_code ?? "VND"
      );
      setPaymentType(order.metadata.infos?.codeType ?? 1);
      setInsurance(order.metadata.infos?.insurancePackage)
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
        paymentType: order.metadata.infos?.codeType ?? null,
        paymentAmount: order.metadata.infos?.codInJapan,
      });
    }
  }, [order, form,orderId]);

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
    setRateProduct(0)
    onCancel();
  };
  return (
    <>
      <Modal
        styles={{
          body: {
            maxHeight: "80vh",
            overflowY: "auto",
            paddingRight: "8px",
            overflowX: "hidden",
          },
        }}
        title="Chỉnh sửa Đơn hàng cho Khách hàng"
        open={isOpen}
        onCancel={handleCancel}
        centered
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              if (order?.status !== OrderStatusType.PENDING_APPROVAL) {
                return;
              }
              handleOk();
            }}
            className="bg-blue-500"
            disabled={order?.status !== OrderStatusType.PENDING_APPROVAL}
          >
            Chỉnh sửa đơn hàng
          </Button>,
        ]}
        width={800}
      >
        <Form
          // onValuesChange={(changed, allValues) => {
          //     form.setFieldsValue({
          //       deposit: totalFee,
          //     });
          // }}
          form={form}
          layout="vertical"
          initialValues={{ method: "buy" }}
        >
          <Row gutter={24}>
            {/* Thông tin Sản phẩm */}
            <Col span={12}>
              <Divider orientation="left">Thông tin Sản phẩm</Divider>
              <Form.Item
                label="Link Sản phẩm"
                name="link"
                rules={[{ required: true, message: "Vui lòng nhập link!" }]}
                className="!mb-1 "
              >
                <Input
                  placeholder="https://..."
                  className="[&_.ant-input]:!h-11 [&_.ant-input-group-addon]:!p-0"
                />
              </Form.Item>
              <Form.Item
                label="Tên Sản phẩm"
                name="productName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
                className="!mb-1"
              >
                <Input className="!h-11" placeholder="" />
              </Form.Item>
              {/* <Form.Item
                label="Mô tả Sản phẩm"
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
                className="!mb-1"
              >

                <TextArea rows={4} maxLength={500} placeholder="" />
              </Form.Item> */}
              <Form.Item
                label="Mô tả Sản phẩm"
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả sản phẩm!" },
                ]}
              >
                {/* AntD sẽ clone element và pass `value` + `onChange` => TiptapEditor nhận và đồng bộ */}
                <TiptapEditor />
              </Form.Item>
              <Form.Item
                label="Loại sản phẩm"
                name="category"
                rules={[{ required: true, message: "Chọn loại sản phẩm!" }]}
                className="!mb-1"
              >
                <Select
                  className="!h-11"
                  placeholder="-- Chọn loại sản phẩm --"
                >
                  {categories?.map((cat: any) => {
                    return (
                      <>
                        <Option value={cat.id}>{cat.name}</Option>
                      </>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item
                label="Phương thức"
                name="method"
                rules={[{ required: true, message: "Chọn phương thức!" }]}
                className=" !w-full !mb-1"
              >
                <Radio.Group className="!flex !flex-row !w-full gap-4  ">
                  <Radio
                    disabled
                    value="buy"
                    className="!text-blue-500 flex-1 !p-3 rounded-md hover:border-blue-500 border-2 border-blue-300 bg-blue-50"
                  >
                    <div className="font-medium text-blue-800">Mua thẳng</div>
                    <div className="text-xs text-blue-600">
                      Phương thức duy nhất được hỗ trợ
                    </div>
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  label="Giá (¥)"
                  name="priceY"
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    // disabled
                    onChange={(e) => {
                      form.setFieldValue("priceVnd", +priceY * rateProduct);
                    }}
                    min={0}
                  />
                </Form.Item>

                <Form.Item
                  className="!flex-1 !mb-1"
                  label="Giá (VND)"
                  name="priceVnd"
                  style={{ display: "none" }}
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, ",")}
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    disabled
                    placeholder="Tự động tính"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Phí vc nội địa"
                name="paymentType"
                className="!mb-1 "
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn hình thức thanh toán",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn hình thức"
                  onChange={(value) => setPaymentType(value)}
                  options={[
                    { label: "Miễn phí vận chuyển", value: 1 },
                    { label: "ADMIN điền cod", value: 2 },
                  ]}
                  className="!w-full !h-11"
                />
              </Form.Item>
              {paymentType === 2 && (
                <Form.Item
                  label="Số tiền thanh toán"
                  name="paymentAmount"
                  className="!mb-1"
                  rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value?.replace(/,/g, "") as any}
                    className="!w-full !h-11"
                    min={0}
                  />
                </Form.Item>
              )}

              <div className="space-y-4 mt-4">
                <Collapse
                  defaultActiveKey={["1"]}
                  className="!bg-blue-50 !rounded-sm !border !border-blue-200 "
                >
                  <Panel
                    key="1"
                    header={
                      <span className="font-semibold text-blue-800 text-base flex items-center gap-2">
                        <FontAwesomeIcon icon={faCog} /> Dịch vụ bổ sung (tùy
                        chọn)
                      </span>
                    }
                  >
                    <div className="space-y-1 ">
                      {listService?.map((item: ServiceFee) => {
                        if (item.optional) return null;
                        const isChecked = services.includes(item.code);
                        return (
                          <div
                            key={item.id}
                            className="flex items-start justify-between bg-white rounded-md p-4 border border-blue-200 hover:shadow-sm transition"
                          >
                            <div className="flex-1 pr-4">
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) =>
                                  handleServiceChange(e, item.code)
                                }
                                className="!text-blue-600"
                              >
                                <div>
                                  <div className="font-medium text-blue-700">
                                    {item.name}
                                  </div>
                                  <div className="text-blue-500 text-sm mt-1">
                                    {item.description}
                                  </div>
                                </div>
                              </Checkbox>
                            </div>
                            <div className="text-blue-600 font-semibold text-sm min-w-[60px] text-right">
                              {item.amount}
                              {item.currency_code}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                </Collapse>
                <Collapse
                  defaultActiveKey={["2"]}
                  className="!bg-yellow-50 !rounded-sm !border !border-yellow-200  !mt-4"
                >
                  <Panel
                    key="2"
                    header={
                      <span className="font-semibold text-yellow-800 text-base flex items-center gap-1">
                        <FontAwesomeIcon icon={faShield} /> Bảo hiểm đơn hàng
                      </span>
                    }
                  >
                    <div className="space-y-2">
                      {listInsurance?.map((item: InsuranceOptionModel) => {
                        const isChecked = insurance?.id === item.id;

                        return (
                          <div
                            key={item.id}
                            className="flex items-start justify-between bg-white rounded-md p-4 border border-yellow-200 hover:shadow-sm transition"
                          >
                            <div className="flex-1 pr-4">
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => handleInsuranceChange(e, item)}
                                className="!text-yellow-700"
                              >
                                <div>
                                  <div className="font-medium text-yellow-700">
                                    {item.name}
                                  </div>
                                  <div className="text-yellow-500 text-xs mt-1">
                                    {item.description}
                                  </div>
                                </div>
                              </Checkbox>
                            </div>
                            <div className="text-yellow-600 font-semibold text-sm min-w-[50px] text-right">
                              {item.fee_percentage ?? 0}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </Col>
            <Col span={12}>
              <Divider orientation="left">Thông tin Đơn hàng</Divider>
              <Form.Item
                label="Khách hàng"
                name="customer"
                className="!mb-1"
                style={{ display: "none" }}
              >
                <Input
                  style={{ display: "flex", alignItems: "center" }}
                  className="!w-full !h-11"
                  disabled
                  min={0}
                />
              </Form.Item>
              <Form.Item
                label="Khách hàng"
                name="customerName"
                className="!mb-1"
                rules={[
                  { required: true, message: "Vui lòng chọn khách hàng!" },
                ]}
              >
                <Input
                  style={{ display: "flex", alignItems: "center" }}
                  className="!w-full !h-11"
                  disabled
                  min={0}
                />
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  label="Phí DV (¥)"
                  name="feeY"
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    disabled
                    min={0}
                  />
                </Form.Item>

                <Form.Item
                  className="!flex-1 !mb-1 "
                  label="Phí DV (VND)"
                  style={{ display: "none" }}
                  name="feeVnd"
                >
                  <InputNumber
                    className="!w-full !h-11"
                    disabled
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={{ display: "flex", alignItems: "center" }}
                    placeholder="Tự động tính"
                  />
                </Form.Item>
              </div>
              <Form.Item
                className="!flex-1 !mb-1"
                label="Số lượng"
                name="quantity"
              >
                <InputNumber
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  style={{ display: "flex", alignItems: "center" }}
                  className="!w-full !h-11"
                />
              </Form.Item>
              {/* <Form.Item className="!flex-1 !mb-1" label="Phí COD" name="cod">
                <InputNumber
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  style={{ display: "flex", alignItems: "center" }}
                  className="!w-full !h-11"
                />
              </Form.Item> */}
              <Form.Item label="Ghi chú" name="note" className="!mb-1">
                <Input.TextArea
                  className="!h-25"
                  placeholder="Ghi chú thêm về đơn hàng..."
                />
              </Form.Item>

              <div className="p-4 rounded-lg bg-blue-50 mt-4">
                <h4 className="font-medium mb-3">{t("form.orderSummary")}</h4>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Tỷ giá quy đổi</span>
                    <span>
                      {rateValueForPrice
                        ? rateValueForPrice.toLocaleString("en-US")
                        : 0}{" "}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("form.productPrice")}</span>
                    <span>{priceY ? priceY.toLocaleString("en-US") : 0} {currencyCheckCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cước VC nội địa</span>
                    <span>
                      {paymentAmount
                        ? paymentAmount.toLocaleString("en-US")
                        : 0}{" "}
                      {currencyCheckCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("form.serviceFee")}</span>
                    <span>{fees.SERVICE_FEE.toLocaleString("en-US")} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí thanh toán</span>
                    <span>{fees.PAYMENT_FEE.toLocaleString("en-US")} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cước vc quốc tế</span>
                    <span>
                      {fees.DOMESTIC_SHIPPING_FEE.toLocaleString("en-US")} đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phụ thu VC</span>
                    <span>
                      {fees.SHIPPING_SURCHARGE_FEE.toLocaleString("en-US")} đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí bảo hiểm</span>
                    <span>{fees.INSURANCE_FEE.toLocaleString("en-US")} đ</span>
                  </div>
                  {listService?.map((item: any) => (
                    <>
                      {services.includes(item.code) && (
                        <div className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{item.amount.toLocaleString("en-US")} đ</span>
                        </div>
                      )}
                    </>
                  ))}
                </div>

                <hr className="my-2 border-gray-200" />

                <div className="flex justify-between font-semibold">
                  <span>{t("form.total")}:</span>
                  <span>
                    {totalFeeCheck
                      ? (
                          totalFeeCheck +
                          priceVND * (quantity ?? 0)
                        ).toLocaleString("en-US")
                      : 0}
                    đ
                  </span>
                </div>

                <div className="flex justify-between text-green-600 font-semibold">
                  <span>{t("form.deposit")}:</span>
                  <span>
                    {fees.INSURANCE_FEE.toLocaleString("en-US")} đ
                  </span>
                </div>
                {/* <div className="flex justify-between text-red-600 font-semibold">
                  <span>{t("form.remaining")}:</span>
                  <span>
                    {(() => {
                      const value =
                        totalFeeCheck +
                        priceVND * (quantity ?? 0) -
                        (totalFee ?? 0);

                      return isNaN(value) ? 0 : value.toLocaleString("en-US");
                    })()}{" "}
                    đ
                  </span>
                </div> */}
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
