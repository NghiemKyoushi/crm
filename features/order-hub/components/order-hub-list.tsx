import React, { useState } from "react";
import { Tag, Button, Input, Select, Form, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFilter,
  faMagnifyingGlass,
  faPlus,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import CreateOrderModal from "./modal/add-orderhub-modal";
import OrderDetailModal from "./modal/orderhub-detail-modal";
import { useTranslation } from "react-i18next";
import {
  useApproveOrder,
  useCancelOrder,
  useCheckOrder,
  useCompleteOrder,
  useListOrder,
  usePurchaseOrder,
  useTrackingOrder,
  useTrackingOrderVN,
} from "../hooks/orderhub";
import { ApproveOrderModel, Invoice, OrderStatusType } from "@/types/orderhub";
import TableComponent from "@/components/TableComponent";
import dayjs from "dayjs";
import ApproveOrderModal from "./modal/approve-order-modal";
import CheckOrderModal from "./modal/check-order-modal";
import TrackingModal from "./modal/tracking-modal";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import PopupConfirm from "@/components/PopupConfirm";
import CancelReasonModal from "@/features/finance-manage/components/tabs/deposit/modal/modal-cancel-statement";
import TrackingModalJP from "./modal/tracking-modal-jp";
import EditOrderModal from "./modal/edit-order-modal";

const { Option } = Select;

export default function OrderHub() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [isOpenApproveOrder, setIsOpenApproveOrder] = useState(false);
  const [isOpenCheckOrder, setIsOpenCheckOrder] = useState(false);
  const [isOpenTrackingOrder, setIsOpenTrackingOrder] = useState(false);
  const [isOpenTrackingOrderVN, setIsOpenTrackingOrderVN] = useState(false);

  const [orderDetail, setOrderDetail] = useState<Invoice>();
  const [openConfirmPurchase, setOpenConfirmPurchase] = useState(false);
  const [openConfirmComplete, setOpenConfirmComplete] = useState(false);

  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [filters, setFilters] = useState({
    search: undefined,
    status: undefined,
    date: undefined,
  });

  const { data: listOrder } = useListOrder({
    page,
    size: 10,
    search: filters.search,
    status: filters.status,
    date: filters.date,
  });
  const approveMutation = useApproveOrder();
  const useCancelMutation = useCancelOrder();
  const purchaseMutation = usePurchaseOrder();
  const trackingJPMutation = useTrackingOrder();
  const trackingVNMutation = useTrackingOrderVN();
  const checkOrderVNMutation = useCheckOrder();
  const useCompleteMutation = useCompleteOrder();

  const queryClient = useQueryClient();

  const handleFinish = (values: any) => {
    setFilters({
      search: values.keyword && values.keyword.trim() !== "" ? values.keyword : undefined,
      status: values.status !== "" ? values.status : undefined,
      date: values.date ? values.date.format("YYYY-MM-DD") : undefined,
    });
    setPage(1);
  };

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleConfirmPurchaseOrder = () => {
    if (orderDetail)
      purchaseMutation.mutate(
        {
          id: orderDetail.id.toString(),
        },
        {
          onSuccess: () => {
            toast.success(t("toast.confirmPurchaseSuccess"));
            queryClient.invalidateQueries({
              queryKey: ["listorder"],
            });
            setOpenConfirmPurchase(false);
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
  };

  const handleCompleteOrder = () => {
    if (orderDetail)
      useCompleteMutation.mutate(
        {
          id: orderDetail.id.toString(),
        },
        {
          onSuccess: () => {
            toast.success(t("toast.completeOrderSuccess"));
            queryClient.invalidateQueries({
              queryKey: ["listorder"],
            });
            setOpenConfirmComplete(false);
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
  };

  const handleCancel = (reason: string) => {
    if (orderDetail)
      useCancelMutation.mutate(
        {
          reason: reason,
          id: orderDetail.id.toString(),
        },
        {
          onSuccess: () => {
            toast.success(t("toast.rejectOrderSuccess"));
            queryClient.invalidateQueries({
              queryKey: ["listorder"],
            });
            setIsOpenCancel(false);
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
  };

  const handleCheckOrder = (value: any) => {
    if (orderDetail)
      checkOrderVNMutation.mutate(
        {
          body: {
            description: value.note,
            weight: value.actualWeight,
            weight_fee: value.feePerKg,
          },
          id: orderDetail.id.toString(),
        },
        {
          onSuccess: () => {
            toast.success(t("toast.inspectGoodsSuccess"));
            queryClient.invalidateQueries({
              queryKey: ["listorder"],
            });
            setIsOpenCheckOrder(false);
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: t("table.orderCode"),
      dataIndex: "invoice_no",
      key: "invoice_no",
      width: 140,
      render: (text, record) => (
        <div>
          <a className="text-blue-600">{text}</a>
          <div className="text-xs text-gray-500">
            {dayjs(record.created_at).format("DD/MM/YYYY HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: t("table.customer"),
      key: "customer",
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-gray-800">{record.customer_name}</div>
          <div className="text-xs text-gray-500">{record.customer_code || "-"}</div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 350,
      render: (_, record) => {
        const product = record.metadata.items[0].product;
        const url = product.url;
        const name = product.map_data.productName;
        const price = product.map_data.price;
        const images = product.map_data.images || [];
        const thumbnail = images.length > 0 ? images[0] : null;

        return (
          <div className="flex gap-3">
            {thumbnail && (
              <img
                src={thumbnail}
                alt={name}
                className="w-16 h-16 object-cover rounded border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                }}
              />
            )}
            <div className="flex-1 space-y-1 min-w-0">
              <div className="text-gray-800 line-clamp-2 text-sm">{name}</div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline block truncate"
              >
                {url}
              </a>
              <div className="text-xs text-gray-500">
                Giá: {price ? `¥${parseFloat(price).toLocaleString()}` : "-"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Thông tin đơn hàng",
      key: "order_info",
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-gray-500">Tổng: </span>
            <span className="text-gray-800">{record.amount_vnd.toLocaleString("vi-VN")}đ</span>
          </div>
          {record.deposit_amount && (
            <div className="text-xs">
              <span className="text-gray-500">Cọc: </span>
              <span className="text-green-600">{record.deposit_amount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
          {record.remain_amount && (
            <div className="text-xs">
              <span className="text-gray-500">Còn lại: </span>
              <span className="text-orange-600">{record.remain_amount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tracking & Cân nặng",
      key: "tracking",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          {record.tracking_other || record.tracking_vn ? (
            <>
              <a href="#" className="text-blue-500 text-sm hover:underline">
                {record.status === OrderStatusType.ARRIVED_JP_WAREHOUSE &&
                  record.tracking_other}
                {record.status === OrderStatusType.ARRIVED_VN_WAREHOUSE &&
                  record.tracking_vn}
              </a>
              {record.weight && (
                <div className="text-xs text-gray-600">
                  <span className="text-gray-500">KL: </span>
                  {record.weight}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm">Chưa có</span>
          )}
        </div>
      ),
    },
    {
      title: "Ghi chú",
      key: "note",
      width: 150,
      render: (_, record) => (
        <div className="text-sm text-gray-600 line-clamp-2">
          {record.note || record.description || "-"}
        </div>
      ),
    },
    {
      title: t("table.creator"),
      key: "created_by_name",
      width: 120,
      render: (_, record) => (
        <div className="text-sm text-gray-700">{record.created_by_name}</div>
      ),
    },
    {
      title: t("table.status"),
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      render: (status: OrderStatusType) => {
        let color: string;
        let text: string;

        switch (status) {
          case OrderStatusType.PENDING_APPROVAL:
            color = "orange";
            text = t("status.pendingApproval");
            break;
          case OrderStatusType.PENDING_DEPOSIT:
            color = "gold";
            text = t("status.pendingDeposit");
            break;
          case OrderStatusType.DEPOSIT_PAID:
            color = "green";
            text = t("status.depositPaid");
            break;
          case OrderStatusType.PURCHASED:
            color = "blue";
            text = t("status.purchased");
            break;
          case OrderStatusType.ARRIVED_JP_WAREHOUSE:
            color = "purple";
            text = t("status.arrivedJpWarehouse");
            break;
          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            color = "cyan";
            text = t("status.arrivedVnWarehouse");
            break;
          case OrderStatusType.UNDER_INSPECTION:
            color = "lime";
            text = t("status.underInspection");
            break;
          case OrderStatusType.PENDING_PAYMENT:
            color = "red";
            text = t("status.pendingPayment");
            break;
          case OrderStatusType.READY_TO_SHIP:
            color = "geekblue";
            text = t("status.readyToShip");
            break;
          case OrderStatusType.SHIPPED:
            color = "volcano";
            text = t("status.shipped");
            break;
          case OrderStatusType.SHIPPING_REQUEST_CLIENT:
            color = "magenta";
            text = t("status.shippingRequest");
            break;
          case OrderStatusType.CANCELED:
            color = "red";
            text = t("status.cancelled");
            break;
          default:
            color = "default";
            text = status;
        }

        return (
          <Tag key={color} color={color} className="text-xs">
            {text}
          </Tag>
        );
      },
    },
    {
      title: t("table.actions"),
      key: "actions",
      width: 200,
      align: "right",
      fixed: "right",
      onCell: () => ({
        style: {
          textAlign: "right",
        },
      }),
      render: (_, record: Invoice) => {
        const actions: React.ReactNode[] = [];

        switch (record.status) {
          case OrderStatusType.PENDING_APPROVAL:
            if (record.is_user_created) {
              actions.push(
                <Button
                  key={`approve-${record.id}`}
                  size="small"
                  icon={<FontAwesomeIcon icon={faCheck} className="text-xs" />}
                  className="!bg-green-500 !text-white !border-0 !text-xs !px-2"
                  onClick={() => {
                    setOrderDetail(record);
                    setIsOpenApproveOrder(true);
                  }}
                >
                  Duyệt
                </Button>
              );
              actions.push(
                <Button
                  key={`reject-${record.id}`}
                  size="small"
                  className="!bg-red-500 !text-white !border-0 !text-xs !px-2"
                  onClick={() => {
                    setOrderDetail(record);
                    setIsOpenCancel(true);
                  }}
                >
                  Từ chối
                </Button>
              );
            }
            break;

          case OrderStatusType.PURCHASED:
            actions.push(
              <Button
                key={record.status}
                size="small"
                icon={<FontAwesomeIcon icon={faTruck} className="text-xs" />}
                className="!bg-purple-500 !text-white !border-0 !text-xs !px-2"
                onClick={() => {
                  setOrderDetail(record);
                  setIsOpenTrackingOrder(true);
                }}
              >
                Kho JP
              </Button>
            );
            break;

          case OrderStatusType.ARRIVED_JP_WAREHOUSE:
            actions.push(
              <Button
                key={record.status}
                size="small"
                onClick={() => {
                  setOrderDetail(record);
                  if (
                    record.take_photo ||
                    record.is_repacked ||
                    record.is_verify_count
                  ) {
                    setIsOpenTrackingOrderVN(true);
                  } else {
                    trackingVNMutation.mutate(
                      {
                        body: {},
                        id: record.id.toString(),
                      },
                      {
                        onSuccess: () => {
                          toast.success(t("toast.confirmVnWarehouseSuccess"));
                          queryClient.invalidateQueries({
                            queryKey: ["listorder"],
                          });
                          setIsOpenTrackingOrder(false);
                        },
                        onError: (err: any) =>
                          toast.error(
                            err.response?.data?.localizedMessage ||
                              t("common.error")
                          ),
                      }
                    );
                  }
                }}
                icon={<FontAwesomeIcon icon={faTruck} className="text-xs" />}
                className="!bg-indigo-500 !text-white !border-0 !text-xs !px-2"
              >
                Kho VN
              </Button>
            );
            break;

          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            actions.push(
              <Button
                key={record.status}
                size="small"
                icon={<FontAwesomeIcon icon={faTruck} className="text-xs" />}
                className="!bg-indigo-500 !text-white !border-0 !text-xs !px-2"
                onClick={() => {
                  setOrderDetail(record);
                  setIsOpenCheckOrder(true);
                }}
              >
                Kiểm
              </Button>
            );
            break;

          case OrderStatusType.DEPOSIT_PAID:
            actions.push(
              <Button
                key={record.status}
                size="small"
                onClick={() => {
                  setOrderDetail(record);
                  setOpenConfirmPurchase(true);
                }}
                icon={<FontAwesomeIcon icon={faTruck} className="text-xs" />}
                className="!bg-indigo-500 !text-white !border-0 !text-xs !px-2"
              >
                Mua
              </Button>
            );
            break;

          case OrderStatusType.READY_TO_SHIP:
            actions.push(
              <Button
                key={record.status}
                size="small"
                icon={<FontAwesomeIcon icon={faTruck} className="text-xs" />}
                className="!bg-emerald-500 !text-white !border-0 !text-xs !px-2"
                onClick={() => {
                  setOrderDetail(record);
                  setOpenConfirmComplete(true);
                }}
              >
                Giao
              </Button>
            );
            break;
        }

        // nút mặc định luôn có
        actions.push(
          <Button
            key={"1"}
            size="small"
            className="!bg-blue-500 !text-white !border-0 !text-xs !px-2"
            onClick={() => {
              setOpenDetail(true);
              setOrderDetail(record);
            }}
          >
            Chi tiết
          </Button>
        );

        return (
          <div className="flex gap-1 flex-wrap justify-end">{actions}</div>
        );
      },
    },
  ];
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
    {
      value: OrderStatusType.UNDER_INSPECTION,
      label: t("status.underInspection"),
    },
    {
      value: OrderStatusType.PENDING_PAYMENT,
      label: t("status.pendingPayment"),
    },
    { value: OrderStatusType.READY_TO_SHIP, label: t("status.readyToShip") },
    { value: OrderStatusType.SHIPPED, label: t("status.shipped") },
    {
      value: OrderStatusType.SHIPPING_REQUEST_CLIENT,
      label: t("status.shippingRequestClient"),
    },
    { value: OrderStatusType.CANCELED, label: t("status.canceled") },
  ];

  return (
    <div className="p-6 bg-gray-50 ">
      <div className="bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            {t("page.orderManagement")}
          </h2>
          <Button
            type="primary"
            onClick={() => setOpen(true)}
            icon={<PlusOutlined />}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {t("button.createNewOrder")}
          </Button>
        </div>
        <div className="flex flex-col mb-2 gap-4 ">
          <Form form={form} onFinish={handleFinish}>
            <div className="w-full grid grid-cols-4 gap-3 items-center bg-white rounded-lg">
              <Form.Item name="keyword" className="mb-0">
                <Input
                  placeholder={t("placeholder.searchOrderCustomer")}
                  className="w-full h-11"
                />
              </Form.Item>

              <Form.Item name="status" className="mb-0">
                <Select
                  placeholder={t("statusPlaceholder")}
                  className="w-full !h-11"
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
                <DatePicker className="w-full h-11" />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<FontAwesomeIcon icon={faFilter} />}
                  className="w-full  !bg-gray-700 !text-white !font-medium !h-11 !text-base"
                >
                  {t("filter")}
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>

        <div className="overflow-x-auto">
          <TableComponent
            columns={columns}
            dataSource={listOrder?.data || []}
            rowHeight={70}
            pageSize={10}
            page={(listOrder && listOrder.current_page + 1) || 0}
            onPageChange={handleChangePage}
            response={listOrder}
            fontSize={13}
            headerHeight={48}
          />
        </div>
      </div>
      <CreateOrderModal
        isOpen={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
      {/* {orderDetail?.id && (
        <OrderDetailModal
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          idOrder={+orderDetail?.id}
        />
      )} */}

      {orderDetail?.id && (
        <EditOrderModal
          isOpen={openDetail}
          onCancel={() => setOpenDetail(false)}
          orderId={+orderDetail?.id}
          onConfirm={() => console.log()}
        />
      )}

      {orderDetail && (
        <ApproveOrderModal
          open={isOpenApproveOrder}
          customerName={orderDetail?.customer_name}
          orderCode={orderDetail.invoice_no}
          onCancel={() => setIsOpenApproveOrder(false)}
          onSubmit={(data: ApproveOrderModel) => {
            approveMutation.mutate(
              {
                body: data,
                id: orderDetail.id.toString(),
              },
              {
                onSuccess: () => {
                  toast.success(t("toast.confirmOrderSuccess"));
                  queryClient.invalidateQueries({
                    queryKey: ["listorder"],
                  });
                  setIsOpenApproveOrder(false);
                },
                onError: (err: any) =>
                  toast.error(
                    err.response?.data?.localizedMessage || t("common.error")
                  ),
              }
            );
          }}
        />
      )}
      {orderDetail && (
        <CheckOrderModal
          open={isOpenCheckOrder}
          customerName={orderDetail.customer_name}
          feePerKg={10}
          onCancel={() => setIsOpenCheckOrder(false)}
          onSubmit={handleCheckOrder}
          orderCode={orderDetail.invoice_no}
        />
      )}

      {orderDetail && (
        <TrackingModalJP
          customerName={orderDetail.customer_name}
          orderCode={orderDetail.invoice_no}
          onCancel={() => setIsOpenTrackingOrder(false)}
          onSubmit={(value) => {
            trackingJPMutation.mutate(
              {
                tracking: value.trackingCodes,
                id: orderDetail.id.toString(),
              },
              {
                onSuccess: () => {
                  toast.success(t("toast.confirmJpWarehouseSuccess"));
                  queryClient.invalidateQueries({
                    queryKey: ["listorder"],
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

      {orderDetail && (
        <TrackingModal
          customerName={orderDetail.customer_name}
          orderCode={orderDetail.invoice_no}
          onCancel={() => setIsOpenTrackingOrderVN(false)}
          is_repacked={orderDetail.is_repacked}
          is_verify_count={orderDetail.is_verify_count}
          take_photo={orderDetail.take_photo}
          onSubmit={(value) => {
            trackingVNMutation.mutate(
              {
                body: {
                  count_verify: value.count,
                  image_ids: value.images,
                  is_repacked: value.isRepackage,
                },
                id: orderDetail.id.toString(),
              },
              {
                onSuccess: () => {
                  toast.success(t("toast.confirmVnWarehouseSuccess"));
                  queryClient.invalidateQueries({
                    queryKey: ["listorder"],
                  });
                  setIsOpenTrackingOrderVN(false);
                },
                onError: (err: any) =>
                  toast.error(
                    err.response?.data?.localizedMessage || t("common.error")
                  ),
              }
            );
          }}
          open={isOpenTrackingOrderVN}
        />
      )}

      <PopupConfirm
        open={openConfirmPurchase}
        type={"confirm"}
        title={"Xác nhận đã mua đơn hàng"}
        content={"Đơn hàng đã được mua !"}
        onConfirm={handleConfirmPurchaseOrder}
        onCancel={() => setOpenConfirmPurchase(false)}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
      />

      <PopupConfirm
        open={openConfirmComplete}
        type={"confirm"}
        title={t("modal.confirmCompleteOrder")}
        content={t("modal.orderCompleted")}
        onConfirm={handleCompleteOrder}
        onCancel={() => setOpenConfirmComplete(false)}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
      />

      {orderDetail && (
        <CancelReasonModal
          transactionCode={orderDetail.invoice_no}
          onClose={() => setIsOpenCancel(false)}
          open={isOpenCancel}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
}
