"use client";

import React, { useState } from "react";
import { Form, Input, Button, Tag, DatePicker, Select, Modal, Tooltip } from "antd";
import TableComponent from "@/components/TableComponent";
import {
  useCompleteShippingOrder,
  useListOrderTracking,
} from "@/features/order-hub/hooks/orderhub";
import { OrderStatusType } from "@/types/orderhub";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import TrackingModalShip from "./modal/modal-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Order } from "@/types/operation-manage";
import EnhancedTableWrapper from "@/components/EnhancedTableWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { EyeOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const ProductManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [orderDetail, setOrderDetail] = useState<Order>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [isViewingTracking, setIsViewingTracking] = useState<{
    orderId: number,
    records: Array<{tracking: string, packageCode: string, quantity: number, weight: string}>
  } | null>(null);

  const { data: listOrder } = useListOrderTracking({
    page,
    size: 20,
    status: [
      OrderStatusType.ARRIVED_VN_WAREHOUSE,
      OrderStatusType.READY_TO_SHIP,
      OrderStatusType.SHIPPING_REQUEST_CLIENT,
    ],
  });

  const [isOpenTrackingOrder, setIsOpenTrackingOrder] = useState(false);

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleFinish = (values: any) => {
    // TODO: Implement filter logic
    console.log("Filter values:", values);
  };

  const useCompleteShippingMutation = useCompleteShippingOrder();

  const columns: ColumnsType<Order> = [
    {
      title: "No",
      key: "invoice_no",
      width: 40,
      align: "center",
      render: (_, record) => {
        const invoice_no = record.order_list?.[0]?.invoice_no;
        return <div className="text-xs font-medium text-blue-600">{invoice_no || "-"}</div>;
      },
    },
    {
      title: "Ngày TT",
      key: "payment_created_date",
      width: 80,
      render: (_, record) => {
        const createdAt = record.order_list?.[0]?.created_at;
        return (
          <div className="text-xs text-gray-800">
            {createdAt ? dayjs(createdAt).format("DD/MM/YY") : "-"}
          </div>
        );
      },
    },
    {
      title: "Ngày Về",
      key: "arrival_date",
      width: 80,
      render: (_, record) => (
        <div className="text-xs text-gray-800">-</div>
      ),
    },
    {
      title: "Tracking / Kiện / SL / CN",
      key: "tracking_package",
      width: 200,
      render: (_, record) => {
        const orderData = record.order_list?.[0];
        const trackingRecords = [
          {
            tracking: record.tracking_ship || "",
            packageCode: orderData?.tracking_vn || "",
            quantity: 0, // Số lượng đơn - chưa có trong response, để sau
            weight: orderData?.weight ? `${orderData.weight}g` : ""
          }
        ].filter(r => r.tracking || r.packageCode);

        const hasData = trackingRecords.length > 0;
        const firstRecord = trackingRecords[0];

        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 min-w-0">
                {hasData ? (
                  <>
                    <div className="text-xs truncate">
                      <span className="text-gray-500">Track: </span>
                      <span className="text-gray-800">{firstRecord.tracking || "-"}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Kiện: </span>
                      <span className="text-gray-800">{firstRecord.packageCode || "-"}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">SL: </span>
                      <span className="text-gray-800">{firstRecord.quantity > 0 ? firstRecord.quantity : "-"}</span>
                      <span className="text-gray-500"> | CN: </span>
                      <span className="text-gray-800">{firstRecord.weight || "-"}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">Chưa có dữ liệu</div>
                )}
              </div>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined className="text-xs" />}
                className="!p-0 !h-auto flex-shrink-0"
                onClick={() => setIsViewingTracking({
                  orderId: record.tracking_ship ? parseInt(record.tracking_ship) : 0,
                  records: trackingRecords.length > 0 ? trackingRecords : [
                    { tracking: "", packageCode: "", quantity: 0, weight: "" }
                  ]
                })}
              />
            </div>
            {trackingRecords.length > 1 && (
              <Button
                type="link"
                size="small"
                className="!p-0 !h-auto !text-xs"
                onClick={() => setIsViewingTracking({
                  orderId: record.tracking_ship ? parseInt(record.tracking_ship) : 0,
                  records: trackingRecords
                })}
              >
                +{trackingRecords.length - 1} mục khác
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Khách Hàng / NTạo",
      key: "customer_info",
      width: 200,
      render: (_, record) => {
        const createdByName = record.order_list?.[0]?.created_by_name;
        return (
          <div className="space-y-1">
            <div className="text-xs text-gray-800 font-medium">{record.customer_name || "-"}</div>
            <div className="text-xs text-gray-500">{record.customer_code || "-"}</div>
            <div className="text-xs text-blue-600">
              <span className="text-gray-500">NTạo: </span>
              {createdByName || "-"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Sản Phẩm",
      key: "product",
      width: 280,
      render: (_, record) => {
        const orderList = record.order_list || [];
        const firstItem = orderList.length > 0 ? orderList[0] : null;

        let productName = "Không có sản phẩm";
        let quantity = 0;
        let productImage = null;

        if (firstItem?.metadata) {
          try {
            const metadata = typeof firstItem.metadata === 'string'
              ? JSON.parse(firstItem.metadata)
              : firstItem.metadata;

            const items = metadata?.items || [];
            if (items.length > 0) {
              const product = items[0].product;
              productName = product?.map_data?.productName || productName;
              quantity = items[0].count || 0;
              const images = product?.map_data?.images || [];
              productImage = images.length > 0 ? images[0] : null;
            }
          } catch (e) {
            console.error("Error parsing metadata:", e);
          }
        }

        return (
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
              {productImage ? (
                <img src={productImage} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-400">No img</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs text-gray-800 line-clamp-2">
                {productName}
              </div>
              <div className="text-xs">
                <span className="text-gray-500">SL: </span>
                <span className="text-gray-800">{quantity}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Phụ Phí",
      key: "extra_fee",
      width: 110,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => (
        <div className="text-xs text-gray-800 text-left">-</div>
      ),
    },
    {
      title: "Ghi Chú",
      key: "note",
      width: 140,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const description = record.order_list?.[0]?.description;
        return (
          <div className="text-xs text-gray-600 line-clamp-2">{description || "-"}</div>
        );
      },
    },
    {
      title: "Phí & Tỷ Giá",
      key: "fees_rates",
      width: 160,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const orderData = record.order_list?.[0];
        const shippingFee = orderData?.shipping_fee;
        const weightFee = orderData?.weight_fee;
        const rate = orderData?.rate;
        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="text-gray-500">COD: </span>
              <span className="text-gray-800">
                {shippingFee ? `${shippingFee.toLocaleString("vi-VN")}¥` : "-"}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">CN: </span>
              <span className="text-gray-800">
                {weightFee ? `${weightFee.toLocaleString("vi-VN")}đ` : "-"}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">TG Yên: </span>
              <span className="text-gray-800">{rate || "-"}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "COD (Việt)",
      key: "transfer_fee",
      width: 180,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const orderData = record.order_list?.[0];
        const codPrice = orderData?.cod_shipping_price || 0;
        const shippingPrice = codPrice || orderData?.shipping_fee || 0;
        const shippingCode = orderData?.tracking_vn || "";
        const isShippingRequest = record.status === OrderStatusType.SHIPPING_REQUEST_CLIENT;

        let shippingTypeText = "-";
        let shippingTypeColor = "text-gray-600";

        if (codPrice > 0) {
          shippingTypeText = "COD";
          shippingTypeColor = "text-blue-600";
        }

        const showWarningCode = isShippingRequest && !shippingCode;
        const showWarningPrice = isShippingRequest && !shippingPrice;
        const showWarningType = isShippingRequest && shippingTypeText === "-";

        return (
          <div className="space-y-1">
            <div className="text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Mã: </span>
                {showWarningCode ? (
                  <Tooltip title="Chưa có mã vận chuyển">
                    <ExclamationCircleOutlined className="text-amber-500 text-sm cursor-help" style={{ color: '#f59e0b' }} />
                  </Tooltip>
                ) : (
                  <span className="text-gray-800">{shippingCode || "-"}</span>
                )}
              </div>
              {isShippingRequest && (
                <EditOutlined
                  className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0"
                  onClick={() => {
                    setOrderDetail(record);
                    setIsOpenTrackingOrder(true);
                  }}
                />
              )}
            </div>
            <div className="text-xs flex items-center gap-1">
              <span className="text-gray-500">Giá: </span>
              {showWarningPrice ? (
                <Tooltip title="Chưa có giá vận chuyển">
                  <ExclamationCircleOutlined className="text-amber-500 text-sm cursor-help" style={{ color: '#f59e0b' }} />
                </Tooltip>
              ) : (
                <span className="text-gray-800 font-medium">
                  {shippingPrice > 0 ? `${shippingPrice.toLocaleString("vi-VN")}đ` : "-"}
                </span>
              )}
            </div>
            <div className="text-xs flex items-center gap-1">
              <span className="text-gray-500">HT: </span>
              {showWarningType ? (
                <Tooltip title="Chưa có hình thức">
                  <ExclamationCircleOutlined className="text-amber-500 text-sm cursor-help" style={{ color: '#f59e0b' }} />
                </Tooltip>
              ) : (
                <span className={`font-medium ${shippingTypeColor}`}>
                  {shippingTypeText}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thanh Toán & Công Nợ",
      key: "payment_info",
      width: 170,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const orderData = record.order_list?.[0];
        const depositFee = orderData?.deposit_fee || 0;
        const totalAmount = orderData?.amount_vnd || 0;
        const remaining = totalAmount - depositFee;

        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="text-gray-500">Cọc: </span>
              <span className="text-green-600 font-medium">
                {depositFee > 0 ? `${depositFee.toLocaleString("vi-VN")}đ` : "-"}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Sau cọc: </span>
              <span className="text-orange-600 font-medium">
                {remaining > 0 ? `${remaining.toLocaleString("vi-VN")}đ` : "-"}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Đã TT: </span>
              <span className="text-gray-800">
                {depositFee > 0 ? `${depositFee.toLocaleString("vi-VN")}đ` : "-"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Tổng Chi Phí",
      key: "total_cost",
      width: 130,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const orderData = record.order_list?.[0];
        const weightFee = orderData?.weight_fee || 0;
        const shippingFee = orderData?.shipping_fee || 0;
        const totalCost = weightFee + shippingFee;

        return (
          <div className="text-xs text-gray-800 text-left font-medium">
            {totalCost > 0 ? `${totalCost.toLocaleString("vi-VN")}đ` : "-"}
          </div>
        );
      },
    },
    {
      title: "Tổng",
      key: "total",
      width: 110,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const amountVnd = record.order_list?.[0]?.amount_vnd || record.amountvnd || 0;
        return (
          <div className="text-xs font-medium text-blue-600">
            {amountVnd > 0 ? `${amountVnd.toLocaleString("vi-VN")}đ` : "-"}
          </div>
        );
      },
    },
    {
      title: "Địa Chỉ",
      key: "address",
      width: 160,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const address = record.order_list?.[0]?.address;
        return (
          <div className="text-xs text-gray-600 line-clamp-3">{address || "-"}</div>
        );
      },
    },
    {
      title: "Hành Động",
      key: "status_actions",
      width: 160,
      align: "center",
      fixed: "right",
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      render: (_, record: Order) => {
        let color: string;
        let text: string;
        const status = record.status;

        switch (status) {
          case OrderStatusType.PENDING_APPROVAL:
            color = "orange";
            text = t('status.pendingApproval');
            break;
          case OrderStatusType.PENDING_DEPOSIT:
            color = "gold";
            text = t('status.pendingDeposit');
            break;
          case OrderStatusType.DEPOSIT_PAID:
            color = "green";
            text = t('status.depositPaid');
            break;
          case OrderStatusType.PURCHASED:
            color = "blue";
            text = t('status.purchased');
            break;
          case OrderStatusType.ARRIVED_JP_WAREHOUSE:
            color = "purple";
            text = t('status.arrivedJpWarehouse');
            break;
          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            color = "cyan";
            text = t('status.arrivedVnWarehouse');
            break;
          case OrderStatusType.UNDER_INSPECTION:
            color = "lime";
            text = t('status.underInspection');
            break;
          case OrderStatusType.PENDING_PAYMENT:
            color = "red";
            text = t('status.pendingPayment');
            break;
          case OrderStatusType.READY_TO_SHIP:
            color = "geekblue";
            text = t('status.readyToShip');
            break;
          case OrderStatusType.SHIPPED:
            color = "volcano";
            text = t('status.shipped');
            break;
          case OrderStatusType.SHIPPING_REQUEST_CLIENT:
            color = "magenta";
            text = t('status.shippingRequest');
            break;
          case OrderStatusType.CANCELED:
            color = "red";
            text = t('status.cancelled');
            break;
          default:
            color = "default";
            text = status;
        }

        return (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <Tag
              color={color}
              className="!text-[11px] m-0 !py-1 !px-2 !leading-4 !font-medium"
              style={{
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '100px',
                height: '22px',
                borderRadius: '4px'
              }}
            >
              {text}
            </Tag>
            <Button
              size="small"
              className="!bg-blue-500 hover:!bg-blue-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
              onClick={() => {
                setIsOpenTrackingOrder(true);
                setOrderDetail(record);
              }}
            >
              {t('button.shipped')}
            </Button>
          </div>
        );
      },
    },
  ];

  const orderStatusOptions = [
    {
      value: OrderStatusType.ARRIVED_VN_WAREHOUSE,
      label: t("status.arrivedVnWarehouse"),
    },
    {
      value: OrderStatusType.READY_TO_SHIP,
      label: t("status.readyToShip"),
    },
    {
      value: OrderStatusType.SHIPPING_REQUEST_CLIENT,
      label: t("status.shippingRequestClient"),
    },
    { value: OrderStatusType.SHIPPED, label: t("status.shipped") },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow p-6">
        {/* Header with Filter */}
        <div className="flex flex-col mb-2 gap-4">
          <h2 className="text-lg font-semibold">
            {t('page.importedProductList')}
          </h2>
          <Form form={form} onFinish={handleFinish}>
            <div className="w-full grid grid-cols-4 gap-3 items-center bg-white rounded-lg">
              <Form.Item name="keyword" className="mb-0">
                <Input
                  placeholder="Tìm kiếm theo tracking, khách hàng..."
                  className="w-full !h-8 !text-xs"
                  size="small"
                />
              </Form.Item>

              <Form.Item name="status" className="mb-0">
                <Select
                  placeholder="Chọn trạng thái"
                  className="w-full"
                  size="small"
                  allowClear
                >
                  {orderStatusOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="date" className="mb-0">
                <DatePicker className="w-full !h-8" size="small" placeholder="Chọn ngày" />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<FontAwesomeIcon icon={faFilter} className="text-xs" />}
                  className="w-full !bg-gray-700 !text-white !font-medium !h-8 !text-xs"
                  size="small"
                >
                  Lọc
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>

        <EnhancedTableWrapper className="overflow-x-auto">
          <TableComponent
            columns={columns}
            dataSource={listOrder || []}
            rowHeight={100}
            pageSize={20}
            page={(listOrder && listOrder.current_page + 1) || 0}
            onPageChange={handleChangePage}
            response={undefined}
            fontSize={12}
            headerHeight={48}
          />
        </EnhancedTableWrapper>
      </div>

      {orderDetail && (
        <TrackingModalShip
          customerName={orderDetail.customer_name}
          orderCode={orderDetail.tracking_ship}
          onCancel={() => setIsOpenTrackingOrder(false)}
          onSubmit={(value) => {
            useCompleteShippingMutation.mutate(
              {
                body: {
                  shipping_code: value.shipping_code,
                  // shipping_fee: +value.shipping_fee,
                  shipping_type: value.shipping_type,
                  shipping_fee: value.shipping_fee,
                },
              },
              {
                onSuccess: () => {
                  toast.success(t('toast.confirmShippingSuccess'));
                  queryClient.invalidateQueries({
                    queryKey: ["listorderTracking"],
                  });
                  setIsOpenTrackingOrder(false);
                },
                onError: (err: any) =>
                  toast.error(
                    err.response?.data?.localizedMessage || t("common.error")
                  ),
              }
            );
          }}
          open={isOpenTrackingOrder}
        />
      )}

      {/* Modal View Tracking/Kiện/SL/CN */}
      {isViewingTracking && (
        <ViewTrackingModal
          open={!!isViewingTracking}
          onClose={() => setIsViewingTracking(null)}
          data={isViewingTracking}
        />
      )}
    </div>
  );
};

// Modal View Tracking Component (Read-only)
function ViewTrackingModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: {
    orderId: number;
    records: Array<{tracking: string, packageCode: string, quantity: number, weight: string}>
  };
}) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Thông tin Tracking / Kiện / Số lượng / Cân nặng"
      width="auto"
      centered
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      styles={{
        body: { width: 'fit-content', minWidth: '600px', maxWidth: '90vw' }
      }}
    >
      <div className="space-y-3 py-4">
        {/* Header */}
        <div className="grid grid-cols-[50px_1fr_1fr_120px_120px] gap-3 bg-gray-100 p-3 rounded font-medium text-sm text-gray-700 min-w-[600px]">
          <div className="text-center">#</div>
          <div>Mã Tracking</div>
          <div>Mã Kiện</div>
          <div className="text-center">Số Kiện</div>
          <div className="text-center">Cân Nặng</div>
        </div>

        {/* Read-only Rows */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {data.records.map((record, index) => (
            <div
              key={index}
              className="grid grid-cols-[50px_1fr_1fr_120px_120px] gap-3 items-center p-3 bg-gray-50 border rounded min-w-[600px]"
            >
              {/* STT */}
              <div className="text-center text-sm text-gray-600 font-medium">
                {index + 1}
              </div>

              {/* Mã Tracking */}
              <div className="text-sm text-gray-800 px-3 py-2 bg-white rounded border break-all">
                {record.tracking || "-"}
              </div>

              {/* Mã Kiện */}
              <div className="text-sm text-gray-800 px-3 py-2 bg-white rounded border break-all">
                {record.packageCode || "-"}
              </div>

              {/* Số Kiện */}
              <div className="text-sm text-gray-800 px-3 py-2 bg-white rounded border text-center">
                {record.quantity > 0 ? record.quantity : "-"}
              </div>

              {/* Cân Nặng */}
              <div className="text-sm text-gray-800 px-3 py-2 bg-white rounded border text-center">
                {record.weight || "-"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default ProductManagement;
