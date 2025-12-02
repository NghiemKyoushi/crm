"use client";
import React, { useEffect, useState } from "react";
import { SafetyOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Row,
  Col,
  Collapse,
  Spin,
  Upload,
} from "antd";
import {
  getDataFeeService,
  getDataProductFromLink,
  getRateExchanges,
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
import {
  useCreateNewOrder,
  useListService,
  useListServiceAdmin,
} from "../../hooks/orderhub";
import {
  useListCustomer,
  useListCustomerSale,
} from "@/features/user-management/hooks/staff-manage";
import { useTranslation } from "react-i18next";
import TiptapEditor from "../TiptapEditor";
import { usePermission } from "@/components/layout/PermissionContext";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useListRoutes } from "@/features/web-management/hooks/web-manage";

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
  const { hasPermission, permissions } = usePermission();

  const { isOpen, onCancel } = props;
  const [form] = Form.useForm();
  const [idProduct, setIdProduct] = React.useState<number | null>(null);
  const queryClient = useQueryClient();
  const createNewOrderMutation = useCreateNewOrder();
  const { data: listInsurance, refetch } = useListInsurance();
  const [services, setServices] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<InsuranceOptionModel | null>(null);
  const [prices, setPrice] = useState<number>(0);
  const [rateValueForPrice, setRateValueForPrice] = useState<number>(0);

  const customer = Form.useWatch("customer", form);
  const priceY = Form.useWatch("priceY", form);
  const quantity = Form.useWatch("quantity", form);
  const category = Form.useWatch("category", form);
  const paymentAmount = Form.useWatch("paymentAmount", form);
  const paymentTypeForm = Form.useWatch("paymentType", form);
  const itemQuantity = Form.useWatch("item_quantity", form);
  const [paymentType, setPaymentType] = useState(1);
  const [currencyCode, setCurrencyCode] = useState("");
  const currencyCheckCode = currencyCode === CURRENCY_CODE.JPY ? "¥" : "$";
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [listInsurancesMap, setListInsurancesMap] = useState<any>([]);
  const [listService, setListService] = useState<any[]>([]);

  // Images state
  const [productImages, setProductImages] = useState<string[]>([]);

  // const [userId, setUserId] = useState<number | undefined>(undefined);
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const [isRouteIdNull, setIsRouteIdNull] = useState(false);

  // Fetch routes when route_id is null
  const { data: routesData } = useListRoutes();
  const routes = routesData?.data || [];

  // Helper function to determine currency from route
  const getCurrencyFromRoute = (route: any): string => {
    if (!route) return "";
    const codeOrName = (route.code || route.name || "").toString().toUpperCase();
    if (codeOrName.includes("JP") || codeOrName.includes("JAPAN")) {
      return CURRENCY_CODE.JPY;
    }
    if (codeOrName.includes("US") || codeOrName.includes("USA")) {
      return CURRENCY_CODE.USD;
    }
    return "";
  };

  // Auto-select first route when route_id is null and routes are loaded
  useEffect(() => {
    if (isRouteIdNull && routes.length > 0 && routeId === undefined) {
      setRouteId(routes[0].id);
    }
  }, [isRouteIdNull, routes.length]);

  // Update currency when routeId changes
  useEffect(() => {
    if (routeId && routes.length > 0) {
      const selectedRoute = routes.find((r: any) => r.id === routeId);
      if (selectedRoute) {
        const newCurrency = getCurrencyFromRoute(selectedRoute);
        if (newCurrency) {
          setCurrencyCode(newCurrency);
        }
      }
    }
  }, [routeId, routes]);

  const { data: listServices } = useListServiceAdmin(
    { userId: customer, routeId },
    {
      enabled: !!customer && !!routeId,
      queryKey: ["listService"],
    }
  );

  useEffect(() => {
    if (listServices) {
      setListService(listServices);
    }
  }, [listServices]);

  const [fees, setFees] = useState({
    DOMESTIC_SHIPPING_FEE: 0,
    INSURANCE_FEE: 0,
    MIN_DEPOSIT_PERCENT: 0,
    PAYMENT_FEE: 0,
    SERVICE_FEE: 0,
    SHIPPING_SURCHARGE_FEE: 0,
    TOTAL_ORDER: 0,
    TOTAL_PRODUCT: 0,
    TOTAL_COD_SHIPPING_FEE: 0,
    INSURANCE_FEE_JP: 0,
    PAYMENT_FEE_JP: 0,
    SERVICE_FEE_JP: 0,
    SHIPPING_SURCHARGE_FEE_JP: 0,
    TOTAL_ORDER_JP: 0,
    TOTAL_PRODUCT_JP: 0,
    TOTAL_COD_SHIPPING_FEE_JP: 0,
  });

  // Add loading state for create order button
  const [creatingOrder, setCreatingOrder] = useState(false);

  const handleOk = async () => {
    try {
      await form.validateFields();
      if (idProduct && insurance) {
        // const serviceOptionTrue = listServices.filter(
        //   (item: any) => item.optional
        // );
        const serviceOption = listService
          // ?.filter((item: any) => item.optional === false)
          .map((item: any) => ({
            ...item,
            is_checked: services?.includes(item.code),
          }));
        const itemsPerUnit = form.getFieldValue("itemsPerUnit");
        // Validate route_id is required when route_id was null from Get info
        if (isRouteIdNull && !routeId) {
          toast.error("Vui lòng chọn tuyến đường!");
          return;
        }

        const bodyNewOrder: OrderFeeRequest = {
          data: {
            product_id: idProduct,
            count: quantity,
            description: form.getFieldValue("description"),
            price: form.getFieldValue("priceY"),
            name: form.getFieldValue("productName"),
            item_quantity: form.getFieldValue("item_quantity"),
            images: [...uploadedIds, ...productImages],
            ...(itemsPerUnit && { items_per_unit: itemsPerUnit }),
            ...(isRouteIdNull && routeId && { route_id: routeId }),
          },
          description: form.getFieldValue("note"),
          fees: [...serviceOption],
          insurance_id: insurance?.id,
          user_id: customer,
          product_category_id: form.getFieldValue("category"),
          cod_shipping_price: paymentAmount ? paymentAmount : 0,
          cod_type: paymentTypeForm,
        };

        setCreatingOrder(true);
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
              handleCancel();
              form.resetFields();
              setCreatingOrder(false);
            },
            onError: (err: any) => {
              toast.error(
                err.response?.data?.localizedMessage || t("common.error")
              );
              setCreatingOrder(false);
            },
          }
        );
      }
    } catch (err) {
      console.log("err", err);
      setCreatingOrder(false);
    }
  };

  // ---- Modified for get info loading ----
  const [getInfoLoading, setGetInfoLoading] = useState(false);
  const { mutate } = useMutation<DataFromLink, Error, string>({
    mutationFn: (link: string) => getDataProductFromLink(link),
  });

  const [searchValue, setSearchValue] = useState("");
  const [customerPage, setCustomerPage] = useState(0);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const { data, isLoading } = useListCustomerSale({
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
    setGetInfoLoading(true);
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

        // Check if route_id is null
        if (data.route_id === null || data.route_id === undefined) {
          setIsRouteIdNull(true);
          setRouteId(undefined); // Reset to undefined so useEffect can auto-select first route
        } else {
          setIsRouteIdNull(false);
          setRouteId(data.route_id);
        }

        form.setFieldValue("priceY", data.price);
        // Handle images
        if (Array.isArray(data.images)) {
          setProductImages(data.images);
        } else {
          setProductImages([]);
        }
        toast.success(t("toast.getProductInfoSuccess"));
        setGetInfoLoading(false);
      },
      onError: () => {
        toast.error(t("toast.cannotGetInfoFromLink"));
        setProductImages([]); // reset images if failed
        setGetInfoLoading(false);
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
          setRateValueForPrice(res.rate_to_vnd);
          setPrice(+form.getFieldValue("priceY") * res.rate_to_vnd);
          const resRateExchanges = await getRateExchanges({
            userId: customer,
          });
          setExchangeRates(resRateExchanges);
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
      if (customer && routeId) {
        // const serviceOptionTrue = listServices.filter(
        //   (item: any) => item.optional === true
        // );
        const serviceOption = listService?.map((item: any) => {
          if (!item.optional && services.includes(item.code)) {
            return {
              ...item,
              is_checked: true,
            };
          }
          return {
            ...item,
            is_checked: false,
          };
        });

        const bodyGetFeeService: RateOrderRequest = {
          order_id: null,
          category_fee_id: category,
          fees: [...serviceOption],
          price: priceY ? priceY : 0,
          user_id: form.getFieldValue("customer"),
          insurance_id: insurance ? insurance.id : 0,
          cod_in_japan: paymentAmount ? paymentAmount : 0,
          currency_code: currencyCode,
          quantity: quantity ? quantity : 0,
          route_id: routeId,
          item_quantity: itemQuantity ? itemQuantity : 0,
          exchange_rates: exchangeRates ? exchangeRates : [],
        };
        try {
          const res: FeeServiceCheck = await getDataFeeService(
            bodyGetFeeService
          );
          const insuranceFees = res.insurance_package_list.map((item: any) => {
            return {
              amount_vnd: item.amount_vnd,
              ...item.insurance_package,
            };
          });
          const serviceOptionTrue = listServices.filter(
            (item: any) => item.optional === true
          );
          if (res.service_fee_optional_list.length > 0) {
            setListService([
              ...serviceOptionTrue,
              ...res.service_fee_optional_list,
            ]);
          }
          setListInsurancesMap(insuranceFees);
          setFees({
            DOMESTIC_SHIPPING_FEE: res.domestic_shipping_fee?.amount_vnd ?? -1,
            INSURANCE_FEE: res.insurance_fee?.amount_vnd ?? -1,
            MIN_DEPOSIT_PERCENT: res.min_deposit_percent ?? -1,
            PAYMENT_FEE: res.payment_fee?.amount_vnd ?? -1,
            SERVICE_FEE: res.service_fee?.amount_vnd ?? -1,
            SHIPPING_SURCHARGE_FEE:
              res.shipping_surcharge_fee?.amount_vnd ?? -1,
            TOTAL_ORDER: res.total_order?.amount_vnd ?? -1,
            TOTAL_COD_SHIPPING_FEE:
              res.total_cod_shipping_fee?.amount_vnd ?? -1,
            TOTAL_PRODUCT: res.total_products?.amount_vnd ?? -1,
            INSURANCE_FEE_JP: res.insurance_fee?.amount ?? 0,
            PAYMENT_FEE_JP: res.payment_fee?.amount ?? 0,
            SERVICE_FEE_JP: res.service_fee?.amount ?? 0,
            SHIPPING_SURCHARGE_FEE_JP: res.shipping_surcharge_fee?.amount ?? 0,
            TOTAL_ORDER_JP: res.total_order?.amount ?? 0,
            TOTAL_PRODUCT_JP: res.total_products?.amount ?? 0,
            TOTAL_COD_SHIPPING_FEE_JP: res.total_cod_shipping_fee?.amount ?? 0,
          });
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
    prices,
    quantity,
    priceY,
    category,
    paymentAmount,
    itemQuantity,
    exchangeRates,
    insurance,
    currencyCode,
  ]);

  useEffect(() => {
    if (listInsurance) {
      const insurance = listInsurance.find((item: any) => item.id === 1);
      setInsurance(insurance);
      setListInsurancesMap(listInsurance);
    }
  }, [listInsurance, isOpen]);

  const handleCancel = () => {
    form.resetFields();
    setServices([]);
    setInsurance(null);
    setPrice(0);
    setRouteId(undefined);
    setIsRouteIdNull(false);
    setIdProduct(null);
    setSearchValue("");
    setCustomerPage(0);
    setAllCustomers([]);
    setListInsurancesMap([]);
    setListService([]);
    setRateValueForPrice(0);
    queryClient.removeQueries({ queryKey: ["listService"] });
    queryClient.removeQueries({ queryKey: ["listCustomerSale"] });
    setFees({
      DOMESTIC_SHIPPING_FEE: -1,
      INSURANCE_FEE: -1,
      MIN_DEPOSIT_PERCENT: -1,
      PAYMENT_FEE: -1,
      SERVICE_FEE: -1,
      SHIPPING_SURCHARGE_FEE: -1,
      TOTAL_ORDER: -1,
      TOTAL_PRODUCT: -1,
      TOTAL_COD_SHIPPING_FEE: -1,
      INSURANCE_FEE_JP: -1,
      PAYMENT_FEE_JP: 0,
      SERVICE_FEE_JP: 0,
      SHIPPING_SURCHARGE_FEE_JP: 0,
      TOTAL_ORDER_JP: 0,
      TOTAL_PRODUCT_JP: 0,
      TOTAL_COD_SHIPPING_FEE_JP: 0,
    });
    setProductImages([]);
    setUploadedIds([]);
    setFileList([]);
    onCancel();
    setCreatingOrder(false); // reset loading state just in case
  };

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        quantity: 1,
        item_quantity: 1,
      });
    }
  }, [isOpen]);

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);

  const beforeUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error(t("validation.onlyImageFiles"));
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      toast.error(t("validation.imageSizeLimit"));
      return Upload.LIST_IGNORE;
    }

    setUploading(true); // 👉 bật loading

    try {
      const newId = await uploadImage(file);
      setUploadedIds((prev) => [...prev, newId]);

      setFileList((prev) => [
        ...prev,
        {
          uid: String(Date.now()),
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
        },
      ]);
      return false;
    } catch (err) {
      toast.error(t("validation.uploadFailed"));
      return Upload.LIST_IGNORE;
    } finally {
      setUploading(false); // 👉 tắt loading
    }
  };

  const handleChange = ({ fileList }: { fileList: any[] }) => {
    setFileList(fileList);
  };

  return (
    <>
      <Modal
        styles={{
          body: {
            maxHeight: "74vh",
            overflowY: "auto",
            overflowX: "hidden",
          },
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tạo Đơn hàng cho Khách hàng
              </h3>
              <p className="text-sm text-gray-500">
                Tạo đơn hàng mới cho khách hàng
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
              disabled={creatingOrder}
            >
              Hủy bỏ
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              loading={creatingOrder}
              size="large"
              className="!bg-gradient-to-r !from-green-500 !to-green-600 !h-11 !px-6 !border-0 hover:!from-green-600 hover:!to-green-700"
            >
              Tạo đơn hàng
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
                    className="!mb-4"
                  >
                    <Input
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
                      className="[&_.ant-input-affix-wrapper]:!h-11 !rounded-lg hover:!border-blue-400 focus:!border-blue-500"
                      addonAfter={
                        <Button
                          type="dashed"
                          onClick={handleGetInfo}
                          className="!h-9"
                          loading={getInfoLoading}
                          disabled={getInfoLoading}
                        >
                          Get info
                        </Button>
                      }
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
                    className="!mb-4 [&_.ant-form-item-explain]:!mt-2"
                  >
                    <Input
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
                    <TiptapEditor />
                  </Form.Item>

                  {productImages && productImages.length > 0 && (
                    <div className="!mb-4">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        Ảnh sản phẩm
                      </div>
                      <div
                        className="flex gap-3 mb-2 overflow-x-auto"
                        style={{ maxWidth: "100%", paddingBottom: 4 }}
                      >
                        {productImages.map((src, idx) => (
                          <div
                            key={src + idx}
                            style={{
                              border: "1px solid #eee",
                              borderRadius: 10,
                              padding: 4,
                              background: "#f8fafd",
                              boxShadow: "0 2px 8px #0001",
                              minWidth: 120,
                              minHeight: 120,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={src}
                              alt={`product-${idx}`}
                              style={{
                                width: 120,
                                height: 120,
                                objectFit: "cover",
                                borderRadius: 10,
                                background: "#fff",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://via.placeholder.com/120?text=No+Img";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Form.Item label={"Tải ảnh sản phẩm"}>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={handleChange}
                      beforeUpload={beforeUpload}
                      multiple
                      disabled={uploading} // disable khi upload
                    >
                      {fileList.length >= 10 ? null : (
                        <div>
                          {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                        </div>
                      )}
                    </Upload>
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
                        className=" [&_.ant-form-item-explain]:!mt-3"
                      >
                        <Select
                          className=" [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!leading-[44px] [&_.ant-select-selector]:!rounded-lg"
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

                  {/* Route Select - Only show when route_id from Get info is null */}
                  {isRouteIdNull && (
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item
                          label={
                            <span className="text-sm font-medium text-gray-700">
                              Tuyến đường <span className="text-red-500">*</span>
                            </span>
                          }
                          rules={[
                            { required: true, message: "Vui lòng chọn tuyến đường!" },
                          ]}
                          className="!mb-4 [&_.ant-form-item-explain]:!mt-2"
                        >
                          <Select
                            value={routeId}
                            onChange={(value) => {
                              setRouteId(value);
                              // Update currency when route changes
                              const selectedRoute = routes.find((r: any) => r.id === value);
                              if (selectedRoute) {
                                const newCurrency = getCurrencyFromRoute(selectedRoute);
                                if (newCurrency) {
                                  setCurrencyCode(newCurrency);
                                }
                              }
                            }}
                            className="[&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!leading-[44px] [&_.ant-select-selector]:!rounded-lg"
                            placeholder="-- Chọn tuyến đường --"
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
                            {routes.map((route: any) => (
                              <Option key={route.id} value={route.id}>
                                {route.name || route.code}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

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
                          min={0}
                          placeholder="0"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Cước VC nội địa
                          </span>
                        }
                        name="paymentType"
                        className="[&_.ant-form-item-explain]:!mt-3"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn hình thức",
                          },
                        ]}
                      >
                        <Select
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
                              <SettingOutlined className="text-white text-sm" />
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
                                className={`flex items-start justify-between bg-white rounded-lg p-3 border-2 transition-all ${isChecked
                                  ? "border-blue-400 shadow-md"
                                  : "border-gray-200 hover:border-blue-200"
                                  }`}
                              >
                                <div className="flex-1 pr-3">
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={(e) =>
                                      handleServiceChange(e, item.code)
                                    }
                                    className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-blue-500"
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
                                <div className="text-blue-600 font-semibold text-sm whitespace-nowrap">
                                  {item.amount_vnd
                                    ? `${item.amount_vnd.toLocaleString(
                                      "en-US"
                                    )}đ`
                                    : `0đ`}
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
                              <SafetyOutlined className="text-white text-sm" />
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
                          {listInsurancesMap.length > 0 &&
                            listInsurancesMap?.map(
                              (item: InsuranceOptionModel) => {
                                const isChecked = insurance?.id === item.id;
                                return (
                                  <div
                                    key={item.id}
                                    className={`flex items-start justify-between bg-white rounded-lg p-3 border-2 transition-all ${isChecked
                                      ? "border-amber-400 shadow-md"
                                      : "border-gray-200 hover:border-amber-200"
                                      }`}
                                  >
                                    <div className="flex-1 pr-3">
                                      <Checkbox
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
                                      {item.fee_percentage === 0 ? (
                                        "0 đ"
                                      ) : item.amount_vnd ? (
                                        <span>
                                          {" "}
                                          {`${item.amount_vnd.toLocaleString(
                                            "en-US"
                                          )} đ`}
                                        </span>
                                      ) : (
                                        "Cập nhật sau"
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
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
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Khách hàng
                      </span>
                    }
                    name="customer"
                    className="[&_.ant-form-item-explain]:!mt-3"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn khách hàng!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Tìm kiếm khách hàng..."
                      className="[&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg"
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
                        isLoading ? <Spin size="small" /> : "Không tìm thấy"
                      }
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          {isLoading && customerPage > 0 && (
                            <div
                              style={{ textAlign: "center", padding: "8px" }}
                            >
                              <Spin size="small" />
                            </div>
                          )}
                        </>
                      )}
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
                      options={options}
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
                    Tổng quan đơn hàng
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
                      {rateValueForPrice || rateValueForPrice === 0 ? (
                        <span>
                          {" "}
                          {`1 ${currencyCode} = ${rateValueForPrice.toLocaleString(
                            "en-US"
                          )}đ`}
                        </span>
                      ) : (
                        "Cập nhật sau"
                      )}
                    </span>
                  </div>

                  {/* Product Price */}
                  <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm text-blue-700 font-medium">
                      Tổng tiền sản phẩm
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      {fees.TOTAL_PRODUCT !== -1 ? (
                        <>
                          {fees.TOTAL_PRODUCT.toLocaleString("en-US")}đ
                          <span className="text-gray-500 !font-medium !text-xs !pl-1">
                            {fees.TOTAL_PRODUCT_JP.toLocaleString("en-US")}
                            {currencyCheckCode}
                          </span>
                        </>
                      ) : (
                        "Cập nhật sau"
                      )}
                      {/* {currencyCheckCode} */}
                    </span>
                  </div>
                  {/* Fees Section */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Chi phí
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Phí dịch vụ
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.SERVICE_FEE !== -1 ? (
                            <>
                              {fees.SERVICE_FEE.toLocaleString("en-US")}đ
                              <span className="text-gray-500 !font-medium !text-xs !pl-1">
                                {fees.SERVICE_FEE_JP.toLocaleString("en-US")}
                                {currencyCheckCode}
                              </span>
                            </>
                          ) : (
                            "Cập nhật sau"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Phí thanh toán
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.PAYMENT_FEE !== -1 ? (
                            <>
                              {fees.PAYMENT_FEE.toLocaleString("en-US")}đ
                              <span className="text-gray-500 !font-medium !text-xs !pl-1">
                                {fees.PAYMENT_FEE_JP.toLocaleString("en-US")}
                                {currencyCheckCode}
                              </span>
                            </>
                          ) : (
                            "Cập nhật sau"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Cước VC quốc tế
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.DOMESTIC_SHIPPING_FEE !== -1
                            ? `${fees.DOMESTIC_SHIPPING_FEE.toLocaleString(
                              "en-US"
                            )}đ`
                            : "Cập nhật sau"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Phụ thu VC
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {fees.SHIPPING_SURCHARGE_FEE !== -1
                            ? `${fees.SHIPPING_SURCHARGE_FEE.toLocaleString(
                              "en-US"
                            )}đ`
                            : "Cập nhật sau"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded">
                        <span className="text-sm text-gray-600">
                          Phí bảo hiểm
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {insurance?.id == 1
                            ? "0đ"
                            : fees.INSURANCE_FEE !== null &&
                              fees.INSURANCE_FEE !== -1
                              ? `${fees.INSURANCE_FEE.toLocaleString("en-US")}đ`
                              : "Cập nhật sau"}
                        </span>
                      </div>

                      {/* Additional Services */}
                      {/* {listService?.map(
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
                      )} */}
                      <Collapse defaultActiveKey={["1"]} ghost>
                        <Panel header="Danh sách dịch vụ" key="1">
                          {listService
                            ?.filter(
                              (item: any) =>
                                services.includes(item.code) &&
                                !["SER_PURCHARSE", "SER_PAYMENT"].includes(
                                  item.code
                                ) // loại bỏ 2 mã này
                            )
                            .map((item: any) => (
                              <div
                                key={item.code}
                                className="flex justify-between items-center py-1.5 px-3 bg-white rounded mb-1"
                              >
                                <span className="text-sm text-gray-600">
                                  {item.name}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.amount_vnd
                                    ? `${item.amount_vnd.toLocaleString(
                                      "en-US"
                                    )}đ`
                                    : `0đ`}
                                </span>
                              </div>
                            ))}
                        </Panel>
                      </Collapse>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-3 pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md">
                      <span className="text-base font-bold text-white">
                        Tổng cộng:
                      </span>
                      <span className="text-lg font-bold text-white">
                        {Number(fees.TOTAL_ORDER) && fees.TOTAL_ORDER !== -1 ? (
                          <>
                            {Number(fees.TOTAL_ORDER).toLocaleString("en-US")}đ
                          </>
                        ) : (
                          "Cập nhật sau"
                        )}
                      </span>
                    </div>
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
