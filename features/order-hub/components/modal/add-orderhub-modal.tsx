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
  const [services, setServices] = useState<number[]>([]);
  const [insurance, setInsurance] = useState<InsuranceOptionModel | null>(null);
  const customer = Form.useWatch("customer", form);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("values", form.getFieldsValue());
      if (idProduct && insurance) {
        const bodyNewOrder: OrderFeeRequest = {
          data: [{ product_id: idProduct, count: 1 }],
          deposit_fee: 0,
          description: form.getFieldValue("note"),
          fee_codes: [],
          insurance_id: insurance?.id,
          user_id: customer,
        };
        createNewOrderMutation.mutate(
          {
           ...bodyNewOrder
          },
          {
            onSuccess: () => {
              toast.success("Tạo order mới thành công!");
              queryClient.invalidateQueries({
                queryKey: ["listorder"],
              });
            },
            onError: (err: any) =>
              toast.error(
                err.response?.data?.localizedMessage || t("common.error")
              ),
          }
        );
      }

      // form.resetFields();
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
      toast.warning("Vui lòng nhập link trước!");
      return;
    }
    mutate(linkValue, {
      onSuccess: (data: DataFromLink) => {
        form.setFieldsValue({
          productName: data?.product_name || "",
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

  const handleServiceChange = (e: CheckboxChangeEvent, id: number) => {
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
      if (form.getFieldValue("customer") && idProduct && insurance) {
        const bodyGetFeeService: RateOrderRequest = {
          category_fee_id: 0,
          fee_codes: services,
          price: form.getFieldValue("priceVnd"),
          product_ids: [idProduct],
          user_id: form.getFieldValue("customer"),
          insurance_id: insurance.id,
        };

        try {
          const res = await getDataFeeService(bodyGetFeeService);
          console.log("bodyGetFeeService", bodyGetFeeService);
          console.log("res", res);
        } catch (error) {
          console.error("Error fetching fee service:", error);
        }
      }
    };

    fetchFeeService();
  }, [form, services, idProduct, insurance]);

  useEffect(() => {
    if (listInsurance) {
      setInsurance(listInsurance[0]);
    }
  }, [listInsurance]);

  console.log("check", form.getFieldsValue());
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
        title="Tạo Đơn hàng cho Khách hàng"
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
            onClick={handleOk}
            className="bg-blue-500"
          >
            Tạo Đơn hàng
          </Button>,
        ]}
        width={800}
      >
        <Form form={form} layout="vertical" initialValues={{ method: "buy" }}>
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
                  addonAfter={
                    <Button type="dashed" onClick={handleGetInfo}>
                      Get info
                    </Button>
                  }
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
                <Input
                  className="!h-11"
                  placeholder="VD: iPhone 15 Pro Max..."
                />
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
                    className="!text-blue-500 flex-1 !p-5 rounded-md hover:border-blue-500 border-2 border-blue-300 bg-blue-50"
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
                  <Input disabled className="!w-full !h-11" min={0} />
                </Form.Item>

                <Form.Item
                  className="!flex-1 !mb-1"
                  label="Giá (VND)"
                  name="priceVnd"
                >
                  <Input
                    className="!w-full !h-11"
                    disabled
                    placeholder="Tự động tính"
                  />
                </Form.Item>
              </div>

              <div className="space-y-4">
                {/* Dịch vụ bổ sung */}
                <Collapse
                  defaultActiveKey={["1"]}
                  className="bg-blue-50 rounded-lg border border-blue-200"
                >
                  <Panel
                    key="1"
                    header={
                      <span className="font-semibold text-blue-700">
                        🔧 Dịch vụ bổ sung (tùy chọn)
                      </span>
                    }
                  >
                    <div className="space-y-3">
                      {listService &&
                        listService.map((item: ServiceFee) => {
                          if (!item.optional) {
                            return (
                              <div
                                className="flex items-start justify-between"
                                key={item.id}
                              >
                                <div className="flex-1 pr-4">
                                  <Checkbox
                                    checked={services.includes(item.id)}
                                    onChange={(e) =>
                                      handleServiceChange(e, item.id)
                                    }
                                  >
                                    <div className="font-medium">
                                      {item.name}
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                      {item.description}
                                    </div>
                                  </Checkbox>
                                </div>
                                <div className="text-blue-600 font-medium self-start">
                                  {item.amount}
                                  {item.currency_code}
                                </div>
                              </div>
                            );
                          }
                        })}
                    </div>
                  </Panel>
                </Collapse>
                <Collapse
                  defaultActiveKey={["2"]}
                  className="bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <Panel
                    key="2"
                    header={
                      <span className="font-semibold text-yellow-700">
                        🛡️ Bảo hiểm đơn hàng
                      </span>
                    }
                  >
                    <div className="space-y-3">
                      {listInsurance &&
                        listInsurance.map((item: InsuranceOptionModel) => {
                          const isChecked = insurance?.id === item.id;
                          return (
                            <div
                              key={item.id}
                              className="flex items-start justify-between"
                            >
                              <div className="flex-1 pr-4">
                                <Checkbox
                                  checked={isChecked}
                                  onChange={(e) =>
                                    handleInsuranceChange(e, item)
                                  }
                                >
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-gray-500 text-sm">
                                    {item.description}
                                  </div>
                                </Checkbox>
                              </div>
                              <div className="text-red-500 font-semibold self-start">
                                {item.fee_percentage ? item.fee_percentage : 0}%
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
                rules={[
                  { required: true, message: "Vui lòng chọn khách hàng!" },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Tìm khách hàng theo mã hoặc tên..."
                  className="!w-full !h-11"
                  filterOption={false} // tắt filter local, dùng API search
                  onSearch={(value) => setSearchValue(value)} // update searchValue
                  notFoundContent={
                    isLoading ? <Spin size="small" /> : "Không có dữ liệu"
                  }
                  options={options}
                />
              </Form.Item>

              <div className="flex flex-row gap-1">
                <Form.Item
                  className="!flex-1 !mb-1"
                  label="Phí DV (¥)"
                  name="feeY"
                >
                  <InputNumber className="!w-full !h-11" min={0} />
                </Form.Item>

                <Form.Item
                  className="!flex-1 !mb-1 "
                  label="Phí DV (VND)"
                  name="feeVnd"
                >
                  <Input
                    className="!w-full !h-11"
                    disabled
                    placeholder="Tự động tính"
                  />
                </Form.Item>
              </div>

              <div className="flex flex-row gap-1">
                <Form.Item
                  label="Tiền cọc (VND)"
                  name="deposit"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiền cọc!" },
                  ]}
                  className="!flex-1 !mb-1 "
                >
                  <InputNumber className="!w-full !h-11" min={0} />
                </Form.Item>

                <Form.Item
                  className="!flex-1 !mb-1"
                  label="% Cọc"
                  name="depositPercent"
                >
                  <Input
                    className="!w-full !h-11"
                    disabled
                    placeholder="Tự động tính"
                  />
                </Form.Item>
              </div>

              <Form.Item label="Ghi chú" name="note" className="!mb-1">
                <Input.TextArea
                  className="!h-25"
                  placeholder="Ghi chú thêm về đơn hàng..."
                />
              </Form.Item>

              <div className="p-3 rounded bg-blue-50  mt-4">
                <h4 className="font-medium mb-2">Tổng kết Đơn hàng</h4>
                <p>Giá sản phẩm: {form.getFieldValue("priceVnd")} đ</p>
                <p>Phí dịch vụ: 0 đ</p>
                <hr className="my-2 border-gray-200" />
                <p className="font-semibold">Tổng cộng: 0 đ</p>
                <p className="text-green-600">Tiền cọc: 0 đ</p>
                <p className="text-red-600">Còn lại: 0 đ</p>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
