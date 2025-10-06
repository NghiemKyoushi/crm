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
  RateOrderRequest,
  ServiceFee,
} from "@/types/orderhub";
import { getListProductCategory } from "@/features/fee-settting/apis/fee-setting";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";
import { useListInsurance } from "@/features/fee-settting/hooks/fee-setting";
import { useCreateNewOrder, useListService } from "../../hooks/orderhub";
import { useListCustomer } from "@/features/user-management/hooks/staff-manage";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faShield } from "@fortawesome/free-solid-svg-icons";
import TextArea from "antd/es/input/TextArea";
import TiptapEditor from "../TiptapEditor";

const { Option } = Select;
const { Panel } = Collapse;
interface CreateOrderModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
export const CURRENCY_CODE = {
  JPY: "JPY",
  USD: "USD",
};
export default function CreateOrderModal(props: CreateOrderModalProps) {
  const { t } = useTranslation();

  const { isOpen, onCancel, onConfirm } = props;
  const [form] = Form.useForm();
  const [idProduct, setIdProduct] = React.useState<number | null>(null);
  const queryClient = useQueryClient();
  const createNewOrderMutation = useCreateNewOrder();
  const { data: listInsurance } = useListInsurance();
  const [services, setServices] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<InsuranceOptionModel | null>(null);
  const [prices, setPrice] = useState<number>(0);
  const [rateValueForPrice, setRateValueForPrice] = useState<number>(0);
  const [percenDeposit, setPercenDeposit] = useState<number>(0);
  const [routeId, setRouteId] = useState(0);
  const customer = Form.useWatch("customer", form);
  const priceVND = Form.useWatch("priceVnd", form);
  const priceY = Form.useWatch("priceY", form);
  const quantity = Form.useWatch("quantity", form);
  const category = Form.useWatch("category", form);
  const paymentAmount = Form.useWatch("paymentAmount", form);
  const paymentTypeForm = Form.useWatch("paymentType", form);

  const [paymentType, setPaymentType] = useState(1);
  const [currencyCode, setCurrencyCode] = useState("");
  const currencyCheckCode = currencyCode === CURRENCY_CODE.JPY ? "¥" : "$";
  const { data: listService } = useListService(
    { routeId: routeId },
    {
      enabled: routeId !== 0,
      queryKey: [],
    }
  );
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
            price: form.getFieldValue("priceY"),
            name: form.getFieldValue("productName"),
          },

          // deposit_fee: percenDeposit,
          description: form.getFieldValue("note"),
          fee_codes: [...serviceOptionTrue, ...services],
          insurance_id: insurance?.id,
          user_id: customer,
          product_category_id: form.getFieldValue("category"),
          cod_shipping_price: paymentAmount ? paymentAmount : 0,
          cod_type: paymentTypeForm,
        };
        createNewOrderMutation.mutate(
          {
            ...bodyNewOrder,
          },
          {
            onSuccess: () => {
              toast.success(t("toast.createOrderSuccess"));
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
      console.log('err', err);
      
    }
  };

  const { mutate } = useMutation<DataFromLink, Error, string>({
    mutationFn: (link: string) => getDataProductFromLink(link),
  });
  const [searchValue, setSearchValue] = useState("");
  const [customerPage, setCustomerPage] = useState(0);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const { data, isLoading } = useListCustomer({
    page: customerPage,
    page_size: 10,
    ...(searchValue && { search: searchValue }),
  });

  useEffect(() => {
    if (data?.data) {
      setAllCustomers((prev) => {
        // Nếu là trang đầu tiên, thay thế toàn bộ
        if (customerPage === 0) {
          return data.data;
        }
        // Nếu không, thêm vào danh sách hiện có (loại bỏ trùng lặp)
        const newCustomers = data.data.filter(
          (newCust) =>
            !prev.some((oldCust) => oldCust.user_id === newCust.user_id)
        );
        return [...prev, ...newCustomers];
      });
    }
  }, [data, customerPage]);

  const options =
    allCustomers.map((c) => ({
      value: c.user_id,
      label: `${c.full_name} - ${c.email}`,
    })) ?? [];

  const handleLoadMoreCustomers = () => {
    if (data && customerPage < data.total_pages - 1) {
      setCustomerPage((prev) => prev + 1);
    }
  };

  const handleGetInfo = () => {
    const linkValue = form.getFieldValue("link");
    if (!linkValue) {
      toast.warning(t("toast.pleaseEnterLink"));
      return;
    }
    mutate(linkValue, {
      onSuccess: (data: DataFromLink) => {
        form.setFieldsValue({
          productName: data?.product_name || "",
        });
        form.setFieldsValue({
          description: data.description || "",
        });
        setCurrencyCode(data.currency_code);
        setIdProduct(data.id);
        setRouteId(data.route_id);
        form.setFieldValue("priceY", data.price);
        toast.success(t("toast.getProductInfoSuccess"));
      },
      onError: () => {
        toast.error(t("toast.cannotGetInfoFromLink"));
      },
    });
  };

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
          setRateValueForPrice(res.rate_to_vnd);
          setPrice(+form.getFieldValue("priceY") * res.rate_to_vnd);
        } catch (err) {
          console.error("Error fetching rate:", err);
        }
      }
    };

    fetchRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProduct, customer]);

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

          form.setFieldValue(
            "priceVnd",
            +form.getFieldValue("priceY") * rateValueForPrice
          );
          form.setFieldValue("feeY", Math.ceil(res.service_fee / rateValueForPrice));
          // form.setFieldValue("feeVnd", res.fee_vnd);
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

  const totalFeeCheck =
    fees.DOMESTIC_SHIPPING_FEE +
    fees.INSURANCE_FEE +
    fees.PAYMENT_FEE +
    fees.SERVICE_FEE +
    fees.SHIPPING_SURCHARGE_FEE -
    (paymentAmount ? paymentAmount : 0);
  // const totalFee = ((totalFeeCheck + priceVND) * percenDeposit) / 100;

  // useEffect(() => {
  //   if (totalFee) form.setFieldValue("deposit", totalFee);
  // }, [totalFee, percenDeposit]);

  const handleCancel = () => {
    form.resetFields();
    setServices([]);
    setInsurance(null);
    setPrice(0);
    setPercenDeposit(0);
    setIdProduct(null);
    setSearchValue("");
    setCustomerPage(0);
    setAllCustomers([]);
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
        title={t("modal.createOrderForCustomer")}
        open={isOpen}
        onCancel={handleCancel}
        centered
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t("button.cancel")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="bg-blue-500"
          >
            {t("button.createOrder")}
          </Button>,
        ]}
        width={800}
      >
        <Form form={form} layout="vertical" initialValues={{ method: "buy" }}>
          <Row gutter={24}>
            {/* Thông tin Sản phẩm */}
            <Col span={12}>
              <Divider orientation="left">
                {t("form.productInformation")}
              </Divider>
              <Form.Item
                label={t("form.productLink")}
                name="link"
                rules={[
                  { required: true, message: t("validation.pleaseEnterLink") },
                ]}
                className="!mb-1 "
              >
                <Input
                  placeholder="https://..."
                  className="[&_.ant-input]:!h-11 [&_.ant-input-group-addon]:!p-0"
                  addonAfter={
                    <Button type="dashed" onClick={handleGetInfo}>
                      Get info
                    </Button>
                  }
                />
              </Form.Item>
              <Form.Item
                label={t("form.productName")}
                name="productName"
                rules={[
                  {
                    required: true,
                    message: t("validation.pleaseEnterProductName"),
                  },
                ]}
                className="!mb-1"
              >
                <Input className="!h-11" placeholder="" />
              </Form.Item>
              <Form.Item
                label={t("form.productDescription")}
                name="description"
                rules={[
                  {
                    required: true,
                    message: t("validation.pleaseEnterProductName"),
                  },
                ]}
                className="!mb-1"
              >
                <TiptapEditor />

                {/* <TextArea rows={4} maxLength={500} placeholder="" /> */}
              </Form.Item>
              <Form.Item
                label={t("form.productType")}
                name="category"
                rules={[
                  {
                    required: true,
                    message: t("validation.selectProductType"),
                  },
                ]}
                className="!mb-1"
              >
                <Select
                  className="!h-11"
                  placeholder={t("placeholder.selectProductType")}
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
                label={t("form.method")}
                name="method"
                rules={[
                  { required: true, message: t("validation.selectMethod") },
                ]}
                className=" !w-full !mb-1"
              >
                <Radio.Group className="!flex !flex-row !w-full gap-4  ">
                  <Radio
                    disabled
                    value="buy"
                    className="!text-blue-500 flex-1 !p-3 rounded-md hover:border-blue-500 border-2 border-blue-300 bg-blue-50"
                  >
                    <div className="font-medium text-blue-800">
                      {t("form.directPurchase")}
                    </div>
                    <div className="text-xs text-blue-600">
                      {t("form.onlySupportedMethod")}
                    </div>
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  label={
                    currencyCode
                      ? currencyCode === CURRENCY_CODE.JPY
                        ? t("form.priceJpy")
                        : "Giá ($)"
                      : "Giá"
                  }
                  name="priceY"
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    min={0}
                  />
                </Form.Item>

                <Form.Item
                  className="!flex-1 !mb-1"
                  label={t("form.priceVnd")}
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
                    placeholder={t("form.autoCalculate")}
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
                  items={[
                    {
                      key: "1",
                      label: (
                        <span className="font-semibold text-blue-800 text-base flex items-center gap-2">
                          <FontAwesomeIcon icon={faCog} />{" "}
                          {t("form.additionalServices")}
                        </span>
                      ),
                      children: (
                        <div className="space-y-1">
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
                      ),
                    },
                  ]}
                />

                <Collapse
                  defaultActiveKey={["2"]}
                  className="!bg-yellow-50 !rounded-sm !border !border-yellow-200 !mt-4"
                  items={[
                    {
                      key: "2",
                      label: (
                        <span className="font-semibold text-yellow-800 text-base flex items-center gap-1">
                          <FontAwesomeIcon icon={faShield} />{" "}
                          {t("form.orderInsurance")}
                        </span>
                      ),
                      children: (
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
                                    onChange={(e) =>
                                      handleInsuranceChange(e, item)
                                    }
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
                      ),
                    },
                  ]}
                />
              </div>
            </Col>
            <Col span={12}>
              <Divider orientation="left">{t("form.orderInformation")}</Divider>
              <Form.Item
                label={t("form.customer")}
                name="customer"
                className="!mb-1"
                rules={[
                  {
                    required: true,
                    message: t("validation.pleaseSelectCustomer"),
                  },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t("placeholder.searchCustomer")}
                  className="!w-full !h-11"
                  filterOption={false}
                  onSearch={(value) => {
                    setSearchValue(value);
                    setCustomerPage(0);
                  }}
                  onPopupScroll={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.scrollTop + target.offsetHeight >=
                      target.scrollHeight - 10
                    ) {
                      handleLoadMoreCustomers();
                    }
                  }}
                  notFoundContent={
                    isLoading ? <Spin size="small" /> : t("system.noData")
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      {isLoading && customerPage > 0 && (
                        <div style={{ textAlign: "center", padding: "8px" }}>
                          <Spin size="small" />
                        </div>
                      )}
                    </>
                  )}
                  options={options}
                />
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  // label={t("form.serviceFeeJpy")}
                  label={
                    currencyCode
                      ? currencyCode === CURRENCY_CODE.JPY
                        ? t("form.serviceFeeJpy")
                        : "Phí dịch vụ ($)"
                      : "Phí dịch vụ"
                  }
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
              </div>

              {/* <div className="flex flex-row gap-1">
                <Form.Item
                  label={t("form.depositVnd")}
                  name="deposit"
                  style={{ display: "none" }}
                  rules={[
                    {
                      required: true,
                      message: t("validation.pleaseEnterDeposit"),
                    },
                  ]}
                  className="!flex-1 !mb-1 "
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    min={0}
                  />
                </Form.Item>
              </div> */}
              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                    {
                      validator: (_, value) => {
                        if (value && value > 0) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Số lượng phải lớn hơn 0")
                        );
                      },
                    },
                  ]}
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    min={1}
                  />
                </Form.Item>
              </div>
              <Form.Item label={t("form.note")} name="note" className="!mb-1">
                <Input.TextArea
                  className="!h-25"
                  placeholder={t("form.orderNote")}
                />
              </Form.Item>
              <div className="p-4 rounded-lg bg-blue-50 mt-4">
                <h4 className="text-red-600 font-semibold  mb-3">
                  {t("form.orderSummary")}
                </h4>
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
                    <span>
                      {priceY ? priceY.toLocaleString("en-US") : 0}{" "}
                      {currencyCheckCode}
                    </span>
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

                <div className="flex justify-between text-green-600 font-semibold">
                  <span>{t("form.total")}:</span>
                  <span>
                  {
  (
    (Number(totalFeeCheck) || 0) +
    (Number(priceVND) || 0) * (Number(quantity) || 1)
  ).toLocaleString("en-US")
}
                    đ
                  </span>
                </div>

                {/* <div className="flex justify-between text-green-600 font-semibold">
                  <span>{t("form.deposit")}:</span>
                  <span>
                    - đ
                  </span>
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                  <span>{t("form.remaining")}:</span>
                  <span>
                    {(() => {
                      const value = (totalFeeCheck + priceVND * (quantity ?? 0));

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
