"use client";
import React, { useEffect, useState, useMemo } from "react";
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
  Upload,
  Spin,
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
  OrderStatusType,
  RateOrderRequest,
} from "@/types/orderhub";
import { getListProductCategory } from "@/features/fee-settting/apis/fee-setting";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";
import { useListInsurance } from "@/features/fee-settting/hooks/fee-setting";
import {
  useDetailOrder,
  useListService,
  useListServiceAdmin,
  useUpdateOrder,
} from "../../hooks/orderhub";
import { useListCustomerWithSearch } from "@/features/user-management/hooks/staff-manage";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faShield } from "@fortawesome/free-solid-svg-icons";
import TiptapEditor from "../TiptapEditor";
import { CURRENCY_CODE } from "./add-orderhub-modal";
import { Fee } from "./orderhub-detail-modal";
import { usePermission } from "@/components/layout/PermissionContext";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
import { useListRoutes } from "@/features/web-management/hooks/web-manage";


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
  const { hasPermission } = usePermission();

  const { data: order, refetch, isLoading: isLoadingOrder } = useDetailOrder(props.orderId);

  const { isOpen, onCancel, orderId } = props;
  const [form] = Form.useForm();
  const [idProduct, setIdProduct] = React.useState<number | null>(null);
  const queryClient = useQueryClient();
  const updateOrderMutation = useUpdateOrder();
  const [rateValueForPrice, setRateValueForPrice] = useState<number>(0);
  const [listServiceInOrder, setListServiceInOrder] = useState<Fee[]>([]);
  const [listInsurancesMap, setListInsurancesMap] = useState<any>([]);
  const { data: listInsurance } = useListInsurance();

  const [services, setServices] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<InsuranceOptionModel | null>(null);
  const [prices, setPrice] = useState<number>(0);
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
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);

  const currencyCheckCode = currencyCode === CURRENCY_CODE.JPY ? "¥" : "$";
  const itemQuantity = Form.useWatch("item_quantity", form);

  const [routeId, setRouteId] = useState<number | undefined>(undefined);

  // Check if source_website is null to show route select
  const isSourceWebsiteNull = !order?.source_website;
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

  // Set route_id from product when source_website is null, or fallback to first route
  useEffect(() => {
    if (isSourceWebsiteNull && routes.length > 0 && routeId === undefined) {
      // Priority 1: Get route_id from metadata.items[0].product.route_id
      const productRouteId = order?.metadata?.items?.[0]?.product?.route_id;
      if (productRouteId) {
        setRouteId(productRouteId);
      } else {
        // Priority 2: Fallback to first route if no route_id in product
        setRouteId(routes[0].id);
      }
    }
  }, [isSourceWebsiteNull, routes.length, order?.metadata?.items]);

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

  const { data: listService } = useListServiceAdmin(
    { userId: customer, routeId },
    {
      enabled: !!customer && !!routeId,
      queryKey: ["listServiceAdmin"],
    }
  );
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

  // --------- IMAGE PREVIEW STATE ---------
  const [productImages, setProductImages] = useState<string[]>([]);
  // ----------------------------------------

  const handleOk = async () => {
    try {
      await form.validateFields();

      // Validate route_id is required when source_website is null
      if (isSourceWebsiteNull && !routeId) {
        toast.error("Vui lòng chọn tuyến đường!");
        return;
      }

      if (idProduct && insurance) {
        const itemsPerUnit = form.getFieldValue("itemsPerUnit");
        const bodyNewOrder: OrderFeeRequest = {
          data: {
            product_id: idProduct,
            count: quantity,
            description: form.getFieldValue("description"),
            price: priceY,
            name: form.getFieldValue("productName"),
            item_quantity: form.getFieldValue("item_quantity"),
            images: [...uploadedIds, ...productImages],
            ...(itemsPerUnit && { items_per_unit: itemsPerUnit }),
            ...(isSourceWebsiteNull && routeId && { route_id: routeId }),
          },
          description: form.getFieldValue("note"),
          fees: [...listServiceInOrder],
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
              handleCancel();
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
    setListServiceInOrder((prev) =>
      prev.map((item) =>
        item.code === id ? { ...item, is_checked: checked } : item
      )
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
            order_id: order?.id,
          });
          form.setFieldValue(
            "priceVnd",
            +form.getFieldValue("priceY") * res.rate_to_vnd
          );
          setRateProduct(res.rate_to_vnd);
          setPrice(+form.getFieldValue("priceY") * res.rate_to_vnd);
          const resRateExchanges = await getRateExchanges({
            userId: customer,
          });
          if (!isCheckDisableInput) {
            setExchangeRates(resRateExchanges);
          }
        } catch (err) {
          console.error("Error fetching rate:", err);
        }
      }
    };

    fetchRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProduct, customer, isCheckDisableInput]);

  useEffect(() => {
    const fetchFeeService = async () => {
      if (customer && routeId) {
        const bodyGetFeeService: RateOrderRequest = {
          order_id: orderId,
          category_fee_id: category,
          fees: [...listServiceInOrder],
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
          const serviceOptionTrue = listServiceInOrder.filter(
            (item: any) => item.optional === true
          );
          if (res.service_fee_optional_list.length > 0) {
            setListServiceInOrder([
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
          const feeY =
            res?.service_fee && rateProduct
              ? Math.ceil(res.service_fee.amount_vnd / rateProduct)
              : 0;

          form.setFieldValue("feeY", feeY);
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
    currencyCode,
  ]);

  useEffect(() => {
    if (listInsurance && listInsurance.length > 0) {
      setInsurance(listInsurance[0]);
      setListInsurancesMap(listInsurance);
    }
  }, [listInsurance]);

  // useEffect(() => {
  //   if (totalFee) form.setFieldValue("deposit", totalFee);
  // }, [totalFee, percenDeposit]);

  useEffect(() => {
    if (order && isOpen) {
      setPrice(order.amount_vnd ?? 0);
      setIdProduct(order.metadata.items?.[0]?.product?.id ?? null);

      // --------- HANDLE PRODUCT IMAGES ----------
      let images: string[] = [];
      // Path 1: Try primary property: order.metadata.items?.[0]?.product?.map_data?.image
      // Path 2: If it's an array or list: order.metadata.items?.[0]?.product?.map_data?.images 
      // Path 3: Fallback: order.metadata.items?.[0]?.product?.images (deprecated case)
      // Gather all possible images, if exist.
      const mapData = order.metadata.items?.[0]?.product?.map_data;
      if (mapData) {
        if (Array.isArray(mapData.images) && mapData.images.length > 0) {
          images = mapData.images.filter((u: string) => !!u); // take all non-empty
        } else if (typeof mapData.images === "string" && mapData.images) {
          images = [mapData.images];
        }
      }
      // Fallback for old structure (rare!)
      if (
        (!images || images.length === 0) &&
        Array.isArray(order.metadata.items?.[0]?.product?.map_data.images) &&
        order.metadata.items?.[0]?.product?.map_data.images.length > 0
      ) {
        images = order.metadata.items?.[0]?.product?.map_data.images.filter((u: string) => !!u);
      }
      setProductImages(images || []);
      // ------------------------------------------

      const services: string[] = [];
      order.metadata.infos?.fees?.forEach((item: any) => {
        if (item?.code) services.push(item.code);
      });
      setServices(services);
      setIsCheckDisableInput(
        order?.status !== OrderStatusType.PENDING_APPROVAL
      );
      // Set routeId from product route_id
      // If source_website exists, set directly
      // If source_website is null, set from product.route_id (useEffect will handle fallback if needed)
      const productRouteId = order.metadata.items?.[0]?.product?.route_id;
      if (order.source_website) {
        setRouteId(productRouteId ?? null);
      } else if (productRouteId) {
        // If source_website is null but product has route_id, set it directly
        setRouteId(productRouteId);
      }
      // If source_website is null and no product.route_id, useEffect will set first route
      setRateValueForPrice(order.rate ?? 0);
      setCurrencyCode(
        order.metadata.items?.[0]?.product?.currency_code ?? "VND"
      );
      setPaymentType(order.metadata.infos?.codeType ?? 1);
      setInsurance(order.metadata.infos?.insurancePackage);
      setDepositFee(order?.deposit_fee ?? 0);
      setListServiceInOrder(order.fee_list);
      if (order?.status !== OrderStatusType.PENDING_APPROVAL) {
        setExchangeRates(order.metadata.infos.exchangeRateMap);
      }
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

  const handleCancel = () => {
    form.resetFields();
    setServices([]);
    setInsurance(null);
    setPrice(0);
    setIdProduct(null);
    setSearchValue("");
    setRateProduct(0);
    setRouteId(undefined);
    queryClient.removeQueries({ queryKey: ["listServiceAdmin"] });
    setListInsurancesMap([]);
    setProductImages([]);
    setFileList([]);
    setUploadedIds([]);
    onCancel();
  };

  // Check if user is admin and not in special status
  const isAdminOrCheckStatusAfterPending = useMemo(() => {
    const isAdmin = hasPermission("system.admin");
    const isNotInSpecialStatus =
      order?.status !== OrderStatusType.PENDING_PAYMENT &&
      order?.status !== OrderStatusType.READY_TO_SHIP &&
      order?.status !== OrderStatusType.SHIPPING_REQUEST_CLIENT;
    return isAdmin && isNotInSpecialStatus;
  }, [hasPermission, order?.status]);

  // Check if user has order.edit_approving permission (can only edit when status is ADMIN_PENDING or CLIENT_PENDING)
  const canEditApproving = useMemo(() => {
    const hasEditApprovingPermission = hasPermission("order.edit_approving");
    const isPendingStatus = order?.status === OrderStatusType.ADMIN_PENDING ||
                            order?.status === OrderStatusType.CLIENT_PENDING;
    return hasEditApprovingPermission && isPendingStatus;
  }, [hasPermission, order?.status]);

  // Check if user can edit (has order.edit permission or is admin or has edit_approving with correct status)
  const canEdit = useMemo(() => {
    return isAdminOrCheckStatusAfterPending || hasPermission("order.edit") || canEditApproving ;
  }, [isAdminOrCheckStatusAfterPending, hasPermission, canEditApproving]);

  const canEditShipfee = useMemo(() => {
    return  hasPermission("order.edit") || hasPermission("system.admin") || hasPermission("order.update_shipping_fee")  ;
  }, [hasPermission]);
  // View only mode - has order.view but no order.edit
  const isViewOnly = !canEdit;


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
      toast.success(`Tải ảnh "${file.name}" thành công`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể tải ảnh lên";
      toast.error(`Tải ảnh thất bại: ${errorMessage}`);
      return Upload.LIST_IGNORE;
    } finally {
      setUploading(false); // 👉 tắt loading
    }
  };

  const handleRemove = (file: any) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
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
                {isViewOnly ? "Chi tiết Đơn hàng" : "Chỉnh sửa Đơn hàng"}
              </h3>
              <p className="text-sm text-gray-500">
                {isViewOnly ? "Xem thông tin chi tiết đơn hàng" : "Cập nhật thông tin đơn hàng cho khách hàng"}
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
              {isViewOnly ? "Đóng" : "Hủy bỏ"}
            </Button>
            {canEdit && (
              <Button
                key="submit"
                type="primary"
                onClick={() => handleOk()}
                size="large"
                className="!bg-gradient-to-r !from-blue-500 !to-blue-600 !h-11 !px-6 !border-0 hover:!from-blue-600 hover:!to-blue-700"
              >
                Lưu thay đổi
              </Button>
            )}
          </div>
        }
        width={1000}
      >
        <Spin spinning={isLoadingOrder} tip="Đang tải dữ liệu...">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ method: "buy" }}
            className="mt-6"
            disabled={isViewOnly}
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
                      disabled={true}
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
                      disabled={isCheckDisableInput && !canEdit}
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
                    <TiptapEditor isDisable={isCheckDisableInput && !canEdit} />
                  </Form.Item>
                  {/* -------- IMAGE GALLERY PREVIEW -------- */}
                  {productImages && productImages.length > 0 && (
                    <div className="mb-5">
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {productImages.map((src, idx) => (
                          <div
                            key={src + idx}
                            style={{
                              flex: "none",
                              borderRadius: 8,
                              overflow: "hidden",
                              width: 120,
                              height: 120,
                              border: "1.5px solid #e5e7eb",
                              background: "#fafafa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {/* Use "img" tag for more flexibility */}
                            <img
                              src={src}
                              alt={`Ảnh sản phẩm ${idx + 1}`}
                              style={{
                                objectFit: "cover",
                                width: 120,
                                height: 120,
                                display: "block",
                              }}
                              loading="lazy"
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
                      onRemove={handleRemove}
                      beforeUpload={beforeUpload}
                      multiple
                      disabled={uploading || isViewOnly}
                    >
                      {fileList.length >= 10 ? null : (
                        <div className="flex flex-col items-center justify-center">
                          {uploading ? (
                            <>
                              <LoadingOutlined className="text-blue-500 text-xl" />
                              <span className="mt-2 text-xs text-gray-500">Đang tải...</span>
                            </>
                          ) : (
                            <>
                              <PlusOutlined className="text-gray-400 text-xl" />
                              <span className="mt-2 text-xs text-gray-500">Tải ảnh</span>
                            </>
                          )}
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                  {/* ...rest of product form as before... */}
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
                          disabled={isCheckDisableInput && !canEdit}
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

                  {/* Route Select - Only show when source_website is null */}
                  {isSourceWebsiteNull && (
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
                            Đơn giá ({currencyCheckCode}){" "}
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
                          disabled={isCheckDisableInput && !canEdit}
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
                            Cước VC nội địa
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
                          disabled={
                            // order?.status === OrderStatusType.PENDING_PAYMENT ||
                            order?.status === OrderStatusType.READY_TO_SHIP ||
                            // order?.status ===
                            // OrderStatusType.SHIPPING_REQUEST_CLIENT ||
                            !canEditShipfee
                          }
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
                        disabled={
                           // order?.status === OrderStatusType.PENDING_PAYMENT ||
                           order?.status === OrderStatusType.READY_TO_SHIP ||
                           // order?.status ===
                           // OrderStatusType.SHIPPING_REQUEST_CLIENT ||
                           !canEditShipfee
                        }
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
                          {listServiceInOrder?.map((item: Fee) => {
                            if (item.optional) return null;
                            return (
                              <div
                                key={item.id}
                                className={`flex items-start justify-between bg-white rounded-lg p-3 border-2 transition-all ${item.is_checked
                                  ? "border-blue-400 shadow-md"
                                  : "border-gray-200 hover:border-blue-200"
                                  }`}
                              >
                                <div className="flex-1 pr-3">
                                  <Checkbox
                                    disabled={isCheckDisableInput && !canEdit}
                                    checked={item.is_checked}
                                    onChange={(e) =>
                                      handleServiceChange(e, item.code)
                                    }
                                    className="
                                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-blue-500
                                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-blue-500
                                    [&_.ant-checkbox-disabled.ant-checkbox-checked_.ant-checkbox-inner]:!bg-blue-500
                                    [&_.ant-checkbox-disabled.ant-checkbox-checked_.ant-checkbox-inner]:!border-blue-500
                                    [&_.ant-checkbox-disabled.ant-checkbox-checked_.ant-checkbox-inner::after]:!border-white
                                  "
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
                                    : 0}
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
                                        disabled={isCheckDisableInput && !canEdit}
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
                                        "0đ"
                                      ) : item.amount_vnd ? (
                                        <span>
                                          {" "}
                                          {`${item.amount_vnd.toLocaleString(
                                            "en-US"
                                          )}đ`}
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

                  {/* <Form.Item
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
                  </Form.Item> */}
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
                      disabled={isCheckDisableInput && !canEdit}
                      rows={3}
                      className="!rounded-lg hover:!border-blue-400 focus:!border-blue-500"
                      placeholder="Ghi chú thêm về đơn hàng..."
                    />
                  </Form.Item>
                </div>
              </div>
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
                      {rateValueForPrice ? (
                        <span>
                          {" "}
                          {`1 ${currencyCode} = ${rateValueForPrice.toLocaleString(
                            "en-US"
                          )} đ`}
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
                      {/* {priceY && quantity
                        ? (priceY * quantity).toLocaleString("en-US")
                        : 0}{" "}
                      {currencyCheckCode} */}
                      {fees.TOTAL_PRODUCT && fees.TOTAL_PRODUCT !== -1 ? (
                        <>
                          {fees.TOTAL_PRODUCT.toLocaleString("en-US")}đ{"  "}
                          <span className="text-gray-500 !font-medium !text-xs pl-0.5">
                            {fees.TOTAL_PRODUCT_JP.toLocaleString("en-US")}
                            {currencyCheckCode}
                          </span>
                        </>
                      ) : (
                        "Cập nhật sau"
                      )}
                    </span>
                  </div>

                  {/* Domestic Shipping */}
                  {/* {paymentAmount > 0 && ( */}
                  {/* <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">
                      Cước VC nội địa
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {fees.TOTAL_COD_SHIPPING_FEE &&
                      fees.TOTAL_COD_SHIPPING_FEE !== -1 ? (
                        <>
                          {fees.TOTAL_COD_SHIPPING_FEE.toLocaleString("en-US")}đ
                          <span className="text-gray-500 !font-medium !text-xs !pl-1">
                            {fees.TOTAL_COD_SHIPPING_FEE_JP.toLocaleString(
                              "en-US"
                            )}
                            {currencyCheckCode}
                          </span>
                        </>
                      ) : (
                        "Cập nhật sau"
                      )}
                    </span>
                  </div> */}
                  {/* )} */}

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
                          {fees.SERVICE_FEE && fees.SERVICE_FEE !== -1 ? (
                            <>
                              {fees.SERVICE_FEE.toLocaleString("en-US")}đ
                              <span className="text-gray-500 !font-medium !text-xs pl-0.5">
                                {"  "}
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
                          Phụ thu vận chuyển
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
                            : fees.INSURANCE_FEE !== -1
                              ? `${fees.INSURANCE_FEE.toLocaleString("en-US")}đ`
                              : "Cập nhật sau"}
                        </span>
                      </div>

                      {/* Additional Services */}

                      <Collapse defaultActiveKey={["1"]} ghost>
                        <Panel header="Danh sách dịch vụ" key="1">
                          {listServiceInOrder
                            .filter((item) => !item.optional && item.is_checked)
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
                                    ? item.amount_vnd.toLocaleString("en-US")
                                    : 0}
                                  đ
                                </span>
                              </div>
                            ))}
                        </Panel>
                      </Collapse>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-3 pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md">
                      <span className="text-base font-bold text-white">
                        {t("form.total")}:
                      </span>
                      <span className="text-lg font-bold text-white">
                        {fees.TOTAL_ORDER !== -1 ? (
                          <>
                            {Number(fees.TOTAL_ORDER).toLocaleString("en-US")}đ
                          </>
                        ) : (
                          "Cập nhật sau"
                        )}
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
                      {depositFee
                        ? `${depositFee.toLocaleString("en-US")}đ`
                        : "Cập nhật sau"}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}
