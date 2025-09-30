import React, { useState } from "react";
import { Tag, Button, Input, Select, Form } from "antd";
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

  const { data: listOrder } = useListOrder({
    page,
    size: 10,
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
    console.log("Filter values:", values);
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
            toast.success(t('toast.confirmPurchaseSuccess'));
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
            toast.success(t('toast.completeOrderSuccess'));
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
            toast.success(t('toast.rejectOrderSuccess'));
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
            toast.success(t('toast.inspectGoodsSuccess'));
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
      title: t('table.orderCode'),
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (text, record) => (
        <div>
          <a className="text-blue-600 font-medium">#{text}</a>
          <div className="text-xs text-gray-400">
            {dayjs(record.created_at).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: t('table.customer'),
      key: "customer",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer_name}</div>
          <div className="text-xs text-gray-400">{record.customer_code}</div>
        </div>
      ),
    },
    {
      title: t('table.creator'),
      key: "created_by_name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.created_by_name}</div>
          <div className="text-xs text-gray-400">{record.customer_code}</div>
        </div>
      ),
    },
    {
      title: "Tracking",
      key: "tracking_vn",
      render: (_, record) => (
        <div>
          {record.tracking_other || record.tracking_vn ? (
            <>
              <a href="#" className="text-blue-500 font-medium hover:underline">
                {record.status === OrderStatusType.ARRIVED_JP_WAREHOUSE &&
                  record.tracking_other &&
                  record.tracking_other}
                {record.status === OrderStatusType.ARRIVED_VN_WAREHOUSE &&
                  record.tracking_vn &&
                  record.tracking_vn}
              </a>
              {record.weight && (
                <div className="text-xs text-gray-400">
                  Cân nặng: {record.weight}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400"> - </span>
          )}
        </div>
      ),
    },
    {
      title: t('table.amount'),
      key: "amount",
      render: (_, record) => (
        <div>
          <div>{record.amount.toLocaleString("vi-VN")} đ</div>
          {record.deposit_amount && (
            <div className="text-xs text-gray-500">
              Cọc: {record.deposit_amount.toLocaleString("vi-VN")} đ
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('table.status'),
      dataIndex: "status",
      key: "status",
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
          <Tag key={color} color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: t('table.actions'),
      key: "actions",
      align: "right",
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
                  icon={<FontAwesomeIcon icon={faCheck} />}
                  className="!bg-green-500 !text-white !border-0 !text-xs"
                  onClick={() => {
                    setOrderDetail(record);
                    setIsOpenApproveOrder(true);
                  }}
                >
                  {t('button.approve')}
                </Button>
              );
              actions.push(
                <Button
                key={`reject-${record.id}`}
                size="small"
                  className="!bg-red-500 !text-white !border-0 !text-xs"
                  onClick={() => {
                    setOrderDetail(record);
                    setIsOpenCancel(true);
                  }}
                >
                  {t('button.reject')}
                </Button>
              );
            }
            break;

          // case "WAITING_DEPOSIT":
          // break;

          case OrderStatusType.PURCHASED:
            actions.push(
              <Button
                key={record.status}
                size="small"
                icon={<FontAwesomeIcon icon={faTruck} />}
                className="!bg-purple-500 !text-white !border-0 !text-xs"
                onClick={() => {
                  setOrderDetail(record);
                  setIsOpenTrackingOrder(true);
                }}
              >
                {t('button.transferToJpWarehouse')}
              </Button>
            );
            break;
          //check chụp ảnh
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
                          toast.success(t('toast.confirmVnWarehouseSuccess'));
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
                icon={<FontAwesomeIcon icon={faTruck} />}
                className="!bg-indigo-500 !text-white !border-0 !text-xs"
              >
                {t('button.transferToVnWarehouse')}
              </Button>
            );
            break;

          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            actions.push(
              <Button
                key={record.status}
                size="small"
                icon={<FontAwesomeIcon icon={faTruck} />}
                className="!bg-indigo-500 !text-white !border-0 !text-xs"
                onClick={() => {
                  setOrderDetail(record);
                  setIsOpenCheckOrder(true);
                }}
              >
                {t('button.inspectGoods')}
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
                icon={<FontAwesomeIcon icon={faTruck} />}
                className="!bg-indigo-500 !text-white !border-0 !text-xs"
              >
                {t('button.purchased')}
              </Button>
            );
            break;

          case OrderStatusType.READY_TO_SHIP:
            actions.push(
              <Button
                key={record.status}
                size="small"
                icon={<FontAwesomeIcon icon={faTruck} />}
                className="!bg-emerald-500 !text-white !border-0 !text-xs"
                onClick={() => {
                  setOrderDetail(record);
                  setOpenConfirmComplete(true);
                }}
              >
                {t('button.readyToShip')}
              </Button>
            );
            break;
        }

        // nút mặc định luôn có
        actions.push(
          <Button
            key={'1'}
            size="small"
            className="!bg-blue-500 !text-white !border-0 !text-xs"
            onClick={() => {
              setOpenDetail(true);
              setOrderDetail(record);
            }}
          >
            {t('button.details')}
          </Button>
        );

        return (
          <div className="flex gap-2 flex-wrap justify-end">{actions}</div>
        );
      },
    },
  ];
  return (
    <div className="p-6 bg-gray-50 ">
      <div className="bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('page.orderManagement')}
          </h2>
          <Button
            type="primary"
            onClick={() => setOpen(true)}
            icon={<PlusOutlined />}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {t('button.createNewOrder')}
          </Button>
        </div>
        <div className="flex flex-col mb-2 gap-4 ">
          <Form form={form} onFinish={handleFinish}>
            <div className="w-full grid grid-cols-4 gap-3 items-center bg-white rounded-lg">
              <Form.Item name="keyword" className="mb-0">
                <Input
                  placeholder={t('placeholder.searchOrderCustomer')}
                  className="w-full h-11"
                />
              </Form.Item>

              <Form.Item name="status" className="mb-0">
                <Select
                  placeholder={t("statusPlaceholder")}
                  className="w-full !h-11"
                >
                  <Option value="COMPLETED">{t("status.shipping")}</Option>
                  <Option value="CANCELED">{t("status.arrivedWarehouse")}</Option>
                  <Option value="FAILED">{t("status.delivered")}</Option>
                </Select>
              </Form.Item>

              <Form.Item name="dateRange" className="mb-0">
                <Select placeholder={t("form.source")} className="w-full !h-11">
                  <Option value="WAITING_CONFIRMATION">
                    {t("status.waiting")}
                  </Option>
                </Select>
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

        <TableComponent
          columns={columns}
          dataSource={listOrder?.data || []}
          rowHeight={45}
          pageSize={10}
          page={(listOrder && listOrder.current_page + 1) || 0}
          onPageChange={handleChangePage}
          response={listOrder}
          fontSize={14}
          headerHeight={44}
        />
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
                  toast.success(t('toast.confirmOrderSuccess'));
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
                tracking: value?.trackingCode,
                id: orderDetail.id.toString(),
              },
              {
                onSuccess: () => {
                  toast.success(t('toast.confirmJpWarehouseSuccess'));
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
          // is_repacked={true}
          // is_verify_count={true}
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
                  toast.success(t('toast.confirmVnWarehouseSuccess'));
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
