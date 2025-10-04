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
  const { data: listInsurance } = useListInsurance();
  const { data: listService } = useListService();
  const [services, setServices] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<InsuranceOptionModel | null>(null);
  const [prices, setPrice] = useState<number>(0);
  const [percenDeposit, setPercenDeposit] = useState<number>(0);
  const customer = Form.useWatch("customer", form);
  const deposit = Form.useWatch("deposit", form);
  const feeVnd = Form.useWatch("feeVnd", form);
  const priceVND = Form.useWatch("priceVnd", form);
  const priceY = Form.useWatch("priceY", form);
  const codFee = Form.useWatch("cod", form);
  const [paymentType, setPaymentType] = useState<string>();

  const [rateProduct, setRateProduct] = useState(0);

  const totalFee = ((feeVnd + priceVND) * percenDeposit) / 100;
  const handleOk = async () => {
    try {
      await form.validateFields();
      if (idProduct && insurance) {
        const bodyNewOrder: OrderFeeRequest = {
          data: [
            {
              product_id: idProduct,
              count: 1,
              description: form.getFieldValue("description"),
              price: priceY,
              name: form.getFieldValue("productName"),
            },
          ],
          deposit_fee: deposit,
          description: form.getFieldValue("note"),
          fee_codes: services,
          insurance_id: insurance?.id,
          user_id: customer,
          product_category_id: form.getFieldValue("category"),
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
    } catch (err) {}
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
      refetch(); // gọi lại API mỗi lần modal mở
    }
  }, [props.isOpen, refetch]);

  const options =
    data?.data.map((c) => ({
      value: c.user_id,
      label: `${c.full_name} - ${c.email}`,
    })) ?? [];

  const handleGetInfo = () => {
    const linkValue = form.getFieldValue("link");
    if (!linkValue) {
      toast.warning("Vui lòng nhập link trước!");
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
        setIdProduct(data.id);
        form.setFieldValue("priceY", data.price);
        toast.success("Lấy thông tin sản phẩm thành công!");
      },
      onError: () => {
        toast.error("Không thể lấy thông tin từ link!");
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
        const bodyGetFeeService: RateOrderRequest = {
          category_fee_id: form.getFieldValue("category"),
          fee_codes: services,
          price: priceVND ? priceVND : 0,
          product_ids: idProduct ? [idProduct] : [],
          user_id: form.getFieldValue("customer"),
          insurance_id: insurance ? insurance.id : 0,
          cod: codFee ? codFee : 0,
        };
        try {
          const res: FeeServiceCheck = await getDataFeeService(
            bodyGetFeeService
          );
          form.setFieldValue("feeY", res.fee);
          form.setFieldValue("feeVnd", res.fee_vnd);
          setPercenDeposit(res.min_deposit_percent);
        } catch (error) {
          console.error("Error fetching fee service:", error);
        }
      }
    };

    fetchFeeService();
  }, [form, services, customer, priceVND, prices]);

  useEffect(() => {
    if (listInsurance && listInsurance.length > 0) {
      setInsurance(listInsurance[0]);
    }
  }, [listInsurance]);

  useEffect(() => {
    if (totalFee) form.setFieldValue("deposit", totalFee);
  }, [totalFee, percenDeposit]);

  useEffect(() => {
    if (order) {
      setPrice(order.amount_vnd);
      setIdProduct(order.metadata.items[0]?.product.id);
      order.metadata.infos.fees.map((item) => {
        services.push(item.code);
      });
      //   setServices
      form.setFieldsValue({
        link: order.metadata.items[0]?.product.url,
        productName: order.metadata.items[0]?.product.map_data.productName,
        description: order.metadata.items[0]?.product.map_data.description,
        category: order.metadata.items[0]?.product.id,
        priceY: order.metadata.items[0]?.product.map_data.price,
        priceVnd: order.amount_vnd,
        customer: order.user_id,
        deposit: order.deposit_fee,
        note: order.description,
        customerName: order.customer_name,
        count: order.metadata.items[0].count
      });
    }
  }, [order, form]);

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
        onCancel={onCancel}
        centered
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              if (order?.status !== OrderStatusType.PENDING_DEPOSIT) {
                return;
              }
              handleOk();
            }}
            className="bg-blue-500"
            disabled={order?.status !== OrderStatusType.PENDING_DEPOSIT}
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
                  style={{display: "none"}}
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
                    { label: "Free ship", value: "free_ship" },
                    { label: "Chưa xác định", value: "tra_sau" },
                    { label: "COD", value: "pay_now" },
                  ]}
                  className="!w-full !h-11"
                />
              </Form.Item>
              {paymentType === "pay_now" && (
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

              <div className="flex flex-row gap-1">
                <Form.Item
                  label="Tiền cọc (VND)"
                  name="deposit"
                  style={{ display: "none" }}
                  rules={[
                    { required: true, message: "Vui lòng nhập tiền cọc!" },
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
              </div>
              <Form.Item className="!flex-1 !mb-1" label="Số lượng" name="count">
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
                    <span>Tỉ giá</span>
                    <span>{rateProduct ? rateProduct : 0} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("form.productPrice")}</span>
                    <span>
                      {form.getFieldValue("priceVnd")
                        ? form.getFieldValue("priceVnd").toLocaleString("en-US")
                        : 0}
                      đ
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>{t("form.serviceFee")}</span>
                    <span>{feeVnd ? feeVnd.toLocaleString("en-US") : 0} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vc quốc tế</span>
                    <span>0 đ</span>
                  </div>
                </div>

                <hr className="my-2 border-gray-200" />

                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span>
                    {form.getFieldValue("priceVnd") &&
                    form.getFieldValue("feeVnd")
                      ? (
                          form.getFieldValue("priceVnd") +
                          form.getFieldValue("feeVnd")
                        ).toLocaleString("en-US")
                      : 0}
                    đ
                  </span>
                </div>

                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Tiền cọc:</span>
                  <span>
                    {totalFee ? Number(totalFee).toLocaleString("en-US") : 0} đ
                  </span>
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Còn lại:</span>
                  <span>
                    {(
                      (form.getFieldValue("priceVnd") ?? 0) +
                      (form.getFieldValue("feeVnd") ?? 0) -
                      (totalFee ?? 0)
                    ).toLocaleString("en-US")}{" "}
                    đ
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
