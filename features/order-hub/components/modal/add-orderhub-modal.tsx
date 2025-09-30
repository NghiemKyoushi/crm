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
}
export default function CreateOrderModal(props: CreateOrderModalProps) {
  const { t } = useTranslation();

  const { isOpen, onCancel, onConfirm } = props;
  const [form] = Form.useForm();
  const [idProduct, setIdProduct] = React.useState<number | null>(null);
  const queryClient = useQueryClient();
  const createNewOrderMutation = useCreateNewOrder();
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
              price: form.getFieldValue("priceY"),
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
        createNewOrderMutation.mutate(
          {
            ...bodyNewOrder,
          },
          {
            onSuccess: () => {
              toast.success(t('toast.createOrderSuccess'));
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

  const options =
    data?.data.map((c) => ({
      value: c.user_id,
      label: `${c.full_name} - ${c.email}`,
    })) ?? [];

  const handleGetInfo = () => {
    const linkValue = form.getFieldValue("link");
    if (!linkValue) {
      toast.warning(t('toast.pleaseEnterLink'));
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
        toast.success(t('toast.getProductInfoSuccess'));
      },
      onError: () => {
        toast.error(t('toast.cannotGetInfoFromLink'));
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
        const bodyGetFeeService: RateOrderRequest = {
          category_fee_id: form.getFieldValue("category"),
          fee_codes: services,
          price: priceVND ? priceVND : 0,
          product_ids: idProduct ? [idProduct] : [],
          user_id: form.getFieldValue("customer"),
          insurance_id: insurance ? insurance.id : 0,
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
        title={t('modal.createOrderForCustomer')}
        open={isOpen}
        onCancel={onCancel}
        centered
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {t('button.cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="bg-blue-500"
          >
            {t('button.createOrder')}
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
              <Divider orientation="left">{t('form.productInformation')}</Divider>
              <Form.Item
                label={t('form.productLink')}
                name="link"
                rules={[{ required: true, message: t('validation.pleaseEnterLink') }]}
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
                label={t('form.productName')}
                name="productName"
                rules={[
                  { required: true, message: t('validation.pleaseEnterProductName') },
                ]}
                className="!mb-1"
              >
                <Input className="!h-11" placeholder="" />
              </Form.Item>
              <Form.Item
                label={t('form.productDescription')}
                name="description"
                rules={[
                  { required: true, message: t('validation.pleaseEnterProductName') },
                ]}
                className="!mb-1"
              >
                <TiptapEditor />

                {/* <TextArea rows={4} maxLength={500} placeholder="" /> */}
              </Form.Item>
              <Form.Item
                label={t('form.productType')}
                name="category"
                rules={[{ required: true, message: t('validation.selectProductType') }]}
                className="!mb-1"
              >
                <Select
                  className="!h-11"
                  placeholder={t('placeholder.selectProductType')}
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
                label={t('form.method')}
                name="method"
                rules={[{ required: true, message: t('validation.selectMethod') }]}
                className=" !w-full !mb-1"
              >
                <Radio.Group className="!flex !flex-row !w-full gap-4  ">
                  <Radio
                    disabled
                    value="buy"
                    className="!text-blue-500 flex-1 !p-3 rounded-md hover:border-blue-500 border-2 border-blue-300 bg-blue-50"
                  >
                    <div className="font-medium text-blue-800">{t('form.directPurchase')}</div>
                    <div className="text-xs text-blue-600">
                      {t('form.onlySupportedMethod')}
                    </div>
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  label={t('form.priceJpy')}
                  name="priceY"
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    disabled
                    min={0}
                  />
                </Form.Item>

                <Form.Item
                  className="!flex-1 !mb-1"
                  label={t('form.priceVnd')}
                  name="priceVnd"
                >
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, ",")}
                    style={{ display: "flex", alignItems: "center" }}
                    className="!w-full !h-11"
                    disabled
                    placeholder={t('form.autoCalculate')}
                  />
                </Form.Item>
              </div>

              <div className="space-y-4 mt-4">
                <Collapse
                  defaultActiveKey={["1"]}
                  className="!bg-blue-50 !rounded-sm !border !border-blue-200 "
                  items={[
                    {
                      key: "1",
                      label: (
                        <span className="font-semibold text-blue-800 text-base flex items-center gap-2">
                          <FontAwesomeIcon icon={faCog} /> {t('form.additionalServices')}
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
                          <FontAwesomeIcon icon={faShield} /> {t('form.orderInsurance')}
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
              <Divider orientation="left">{t('form.orderInformation')}</Divider>
              <Form.Item
                label={t('form.customer')}
                name="customer"
                className="!mb-1"
                rules={[
                  { required: true, message: t('validation.pleaseSelectCustomer') },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t('placeholder.searchCustomer')}
                  className="!w-full !h-11"
                  filterOption={false} // tắt filter local, dùng API search
                  onSearch={(value) => setSearchValue(value)} // update searchValue
                  notFoundContent={
                    isLoading ? <Spin size="small" /> : t('system.noData')
                  }
                  options={options}
                />
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  label={t('form.serviceFeeJpy')}
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
                  label={t('form.serviceFeeVnd')}
                  name="feeVnd"
                >
                  <InputNumber
                    className="!w-full !h-11"
                    disabled
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={{ display: "flex", alignItems: "center" }}
                    placeholder={t('form.autoCalculate')}
                  />
                </Form.Item>
              </div>

              <div className="flex flex-row gap-1">
                <Form.Item
                  label={t('form.depositVnd')}
                  name="deposit"
                  rules={[
                    { required: true, message: t('validation.pleaseEnterDeposit') },
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

                {/* <Form.Item
                  className="!flex-1 !mb-1"
                  label="% Cọc"
                  name="depositPercent"
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
                </Form.Item> */}
              </div>

              <Form.Item label={t('form.note')} name="note" className="!mb-1">
                <Input.TextArea
                  className="!h-25"
                  placeholder={t('form.orderNote')}
                />
              </Form.Item>

              <div className="p-4 rounded-lg bg-blue-50 mt-4">
                <h4 className="font-medium mb-3">{t('form.orderSummary')}</h4>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{t('form.productPrice')}</span>
                    <span>
                      {form.getFieldValue("priceVnd")
                        ? form.getFieldValue("priceVnd").toLocaleString("en-US")
                        : 0}
                      đ
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>{t('form.serviceFee')}</span>
                    <span>{feeVnd ? feeVnd.toLocaleString("en-US") : 0} đ</span>
                  </div>

                  {listService &&
                    listService.map((item: ServiceFee) =>
                      item.optional ? (
                        <div key={item.name} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>
                            {item.amount
                              ? item.amount.toLocaleString("en-US")
                              : 0}{" "}
                            đ
                          </span>
                        </div>
                      ) : null
                    )}
                </div>

                <hr className="my-2 border-gray-200" />

                <div className="flex justify-between font-semibold">
                  <span>{t('form.total')}:</span>
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
                  <span>{t('form.deposit')}:</span>
                  <span>
                    {totalFee ? Number(totalFee).toLocaleString("en-US") : 0} đ
                  </span>
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                  <span>{t('form.remaining')}:</span>
                  <span>
                    {(() => {
                      const value =
                        (form.getFieldValue("priceVnd") ?? 0) +
                        (form.getFieldValue("feeVnd") ?? 0) -
                        (totalFee ?? 0);

                      return isNaN(value) ? 0 : value.toLocaleString("en-US");
                    })()}{" "}
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
