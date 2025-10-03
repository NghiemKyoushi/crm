import React, { useState } from "react";
import { Tag, Button, Input, Select, Form, DatePicker, Modal, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
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
import EnhancedTableWrapper from "@/components/EnhancedTableWrapper";

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
  const [isEditingTracking, setIsEditingTracking] = useState<{
    orderId: number,
    records: Array<{tracking: string, packageCode: string, quantity: number, weight: string}>
  } | null>(null);

  // Edit modal states
  const [editingNote, setEditingNote] = useState<{orderId: number, value: string} | null>(null);
  const [editingFeesRates, setEditingFeesRates] = useState<{
    orderId: number,
    codOption: string,
    codAmount: string
  } | null>(null);
  const [editingNoteExtra, setEditingNoteExtra] = useState<{orderId: number, value: string} | null>(null);

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
      title: "No",
      dataIndex: "invoice_no",
      key: "invoice_no",
      width: 40,
      align: "center",
      render: (invoice_no: string) => (
        <div className="text-xs font-medium text-blue-600">{invoice_no || "-"}</div>
      ),
    },
    {
      title: "Ngày TT",
      key: "payment_created_date",
      width: 80,
      render: (_, record) => (
        <div className="text-xs text-gray-800">
          {dayjs(record.created_at).format("DD/MM/YY")}
        </div>
      ),
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
        const trackingRecords = [
          {
            tracking: record.tracking_ship || "",
            packageCode: record.tracking_vn || "",
            quantity: 0, // Số lượng đơn - chưa có trong response, để sau
            weight: record.weight ? `${record.weight}g` : ""
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
                icon={<EditOutlined className="text-xs" />}
                className="!p-0 !h-auto flex-shrink-0"
                onClick={() => setIsEditingTracking({
                  orderId: record.id,
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
                onClick={() => setIsEditingTracking({
                  orderId: record.id,
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
      title: "Sản Phẩm",
      key: "product",
      width: 280,
      render: (_, record) => {
        const product = record.metadata.items[0]?.product;
        const name = product?.map_data?.productName || "-";
        const price = product?.map_data?.price;
        const url = product?.url;
        const images = product?.map_data?.images || [];
        const thumbnail = images.length > 0 ? images[0] : null;

        return (
          <div className="flex gap-2">
            {thumbnail && (
              <img
                src={thumbnail}
                alt={name}
                className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                }}
              />
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs text-gray-800 line-clamp-2">{name}</div>
              <div className="text-xs">
                <span className="text-gray-500">Giá: </span>
                <span className="text-green-600 font-medium">
                  {price ? `¥${parseFloat(price).toLocaleString()}` : "-"}
                </span>
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline inline-block"
                >
                  Xem link
                </a>
              )}
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
      render: (_, record) => (
        <div className="flex items-center justify-between gap-2 h-full">
          <div className="text-xs text-gray-600 line-clamp-2 flex-1">
            {record.note || record.description || "-"}
          </div>
          <EditOutlined
            className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0 self-center"
            onClick={() => setEditingNote({ orderId: record.id, value: record.note || record.description || "" })}
          />
        </div>
      ),
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
        const shippingFee = record.shipping_fee;
        const weightFee = record.weight_fee;
        const rate = record.rate;
        const isPendingApproval = record.status === OrderStatusType.PENDING_APPROVAL;
        const shouldShowWarning = isPendingApproval && !shippingFee;

        return (
          <div className="space-y-1">
            <div className="text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">COD: </span>
                {shouldShowWarning ? (
                  <Tooltip title="Chưa có phí COD">
                    <ExclamationCircleOutlined className="text-amber-500 text-sm cursor-help" style={{ color: '#f59e0b' }} />
                  </Tooltip>
                ) : (
                  <span className="text-gray-800">
                    {shippingFee ? `${shippingFee.toLocaleString("vi-VN")}¥` : "-"}
                  </span>
                )}
              </div>
              <EditOutlined
                className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0"
                onClick={() => setEditingFeesRates({
                  orderId: record.id,
                  codOption: "",
                  codAmount: ""
                })}
              />
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
      title: "Thanh Toán & Công Nợ",
      key: "payment_info",
      width: 170,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const depositFee = record.deposit_fee || 0;
        const totalAmount = record.amount_vnd || 0;
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
              <span className="text-gray-500">Ngày TT: </span>
              <span className="text-gray-800">-</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Đã TT: </span>
              <span className="text-gray-800">-</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Công nợ: </span>
              <span className="text-gray-800">-</span>
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
        const shippingCode = record.tracking_vn || "-";
        const codShippingPrice = record.cod_shipping_price || 0;
        const shippingPrice = codShippingPrice || record.shipping_fee || 0;

        const isCOD = codShippingPrice > 0;
        const shippingTypeText = isCOD ? "COD" : "-";
        const shippingTypeColor = isCOD ? "text-blue-600" : "text-gray-600";

        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="text-gray-500">Mã: </span>
              <span className="text-gray-800">{shippingCode}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Giá: </span>
              <span className="text-gray-800 font-medium">
                {shippingPrice > 0 ? `${shippingPrice.toLocaleString("vi-VN")}đ` : "-"}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">HT: </span>
              <span className={`font-medium ${shippingTypeColor}`}>
                {shippingTypeText}
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
        const shippingFee = record.shipping_fee || 0;
        const weightFee = record.weight_fee || 0;
        const totalCost = shippingFee + weightFee;

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
      render: (_, record) => (
        <div className="text-xs font-medium text-blue-600">
          {record.amount_vnd.toLocaleString("vi-VN")}đ
        </div>
      ),
    },
    {
      title: "Ghi Chú (Admin)",
      key: "note_extra",
      width: 140,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => (
        <div className="flex items-center justify-between gap-2 h-full">
          <div className="text-xs text-gray-600 flex-1">-</div>
          <EditOutlined
            className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0"
            onClick={() => setEditingNoteExtra({ orderId: record.id, value: "" })}
          />
        </div>
      ),
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
      render: (_, record: Invoice) => {
        const status = record.status;
        let color: string;
        let text: string;

        // Xác định màu và text cho tag trạng thái
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

        // Xác định nút action chính dựa trên trạng thái
        let actionButton: React.ReactNode = null;

        switch (record.status) {
          case OrderStatusType.PENDING_APPROVAL:
            if (record.is_user_created) {
              actionButton = (
                <div className="flex gap-1.5 justify-center w-full">
                  <Button
                    key={`approve-${record.id}`}
                    size="small"
                    className="!bg-green-500 hover:!bg-green-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded flex-1"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsOpenApproveOrder(true);
                    }}
                  >
                    ✓ Duyệt
                  </Button>
                  <Button
                    key={`reject-${record.id}`}
                    size="small"
                    className="!bg-red-500 hover:!bg-red-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded flex-1"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsOpenCancel(true);
                    }}
                  >
                    ✕ Từ chối
                  </Button>
                </div>
              );
            }
            break;

          case OrderStatusType.DEPOSIT_PAID:
            actionButton = (
              <Button
                key={record.status}
                size="small"
                onClick={() => {
                  setOrderDetail(record);
                  setOpenConfirmPurchase(true);
                }}
                className="!bg-blue-500 hover:!bg-blue-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
              >
                🛒 XN mua
              </Button>
            );
            break;

          case OrderStatusType.PURCHASED:
            actionButton = (
              <Button
                key={record.status}
                size="small"
                className="!bg-purple-500 hover:!bg-purple-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                onClick={() => {
                  setOrderDetail(record);
                  setIsOpenTrackingOrder(true);
                }}
              >
                🏢 Kho JP
              </Button>
            );
            break;

          case OrderStatusType.ARRIVED_JP_WAREHOUSE:
            actionButton = (
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
                className="!bg-indigo-500 hover:!bg-indigo-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
              >
                🏭 Kho VN
              </Button>
            );
            break;

          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            actionButton = (
              <Button
                key={record.status}
                size="small"
                className="!bg-cyan-600 hover:!bg-cyan-700 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                onClick={() => {
                  setOrderDetail(record);
                  setIsOpenCheckOrder(true);
                }}
              >
                📦 Kiểm hàng
              </Button>
            );
            break;

          case OrderStatusType.READY_TO_SHIP:
            actionButton = (
              <Button
                key={record.status}
                size="small"
                className="!bg-emerald-500 hover:!bg-emerald-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                onClick={() => {
                  setOrderDetail(record);
                  setOpenConfirmComplete(true);
                }}
              >
                🚚 Giao hàng
              </Button>
            );
            break;
        }

        return (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            {/* Tag trạng thái */}
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

            {/* Nút hành động chính (nếu có) */}
            {actionButton}

            {/* Button chi tiết luôn hiển thị */}
            <Button
              size="small"
              type="link"
              className="!text-[11px] !p-0 !h-auto !font-medium hover:!text-blue-700"
              onClick={() => {
                setOpenDetail(true);
                setOrderDetail(record);
              }}
            >
              Chi tiết
            </Button>
          </div>
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

        <div className="flex flex-col mb-2 gap-4 ">
          <Form form={form} onFinish={handleFinish}>
            <div className="w-full grid grid-cols-5 gap-3 items-center bg-white rounded-lg">
              <Form.Item name="keyword" className="mb-0">
                <Input
                  placeholder={t("placeholder.searchOrderCustomer")}
                  className="w-full !h-8 !text-xs"
                  size="small"
                />
              </Form.Item>

              <Form.Item name="status" className="mb-0">
                <Select
                  placeholder={t("statusPlaceholder")}
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
                <DatePicker className="w-full !h-8" size="small" />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<FontAwesomeIcon icon={faFilter} className="text-xs" />}
                  className="w-full !bg-gray-700 !text-white !font-medium !h-8 !text-xs"
                  size="small"
                >
                  {t("filter")}
                </Button>
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  icon={<PlusOutlined className="text-xs" />}
                  className="w-full !bg-blue-600 !text-white !font-medium !h-8 !text-xs"
                  size="small"
                  onClick={() => setOpen(true)}
                >
                  Tạo đơn
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>

        <EnhancedTableWrapper className="overflow-x-auto">
          <TableComponent
            columns={columns}
            dataSource={listOrder?.data || []}
            rowHeight={100}
            pageSize={10}
            page={(listOrder && listOrder.current_page + 1) || 0}
            onPageChange={handleChangePage}
            response={listOrder}
            fontSize={12}
            headerHeight={48}
          />
        </EnhancedTableWrapper>
      
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

      {/* Modal Edit Tracking/Kiện/SL/CN */}
      {isEditingTracking && (
        <EditTrackingModal
          open={!!isEditingTracking}
          onClose={() => setIsEditingTracking(null)}
          initialData={isEditingTracking}
          onSave={(records) => {
            // TODO: Call API to save tracking records
            console.log("Save tracking records:", records);
            toast.success("Đã lưu thông tin tracking");
            setIsEditingTracking(null);
            queryClient.invalidateQueries({
              queryKey: ["listorder"],
            });
          }}
        />
      )}

      {/* Modal Edit Note */}
      {editingNote && (
        <Modal
          open={!!editingNote}
          onCancel={() => setEditingNote(null)}
          title="Cập nhật Ghi Chú"
          width={500}
          footer={[
            <Button key="cancel" onClick={() => setEditingNote(null)}>Hủy</Button>,
            <Button key="submit" type="primary" onClick={() => {
              console.log("Save note:", editingNote);
              toast.success("Đã lưu ghi chú");
              setEditingNote(null);
            }}>Lưu</Button>,
          ]}
        >
          <Form layout="vertical" className="py-4">
            <Form.Item label="Ghi Chú">
              <Input.TextArea
                rows={4}
                value={editingNote.value}
                onChange={(e) => setEditingNote({...editingNote, value: e.target.value})}
                placeholder="Nhập ghi chú"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Modal Edit Fees & Rates */}
      {editingFeesRates && (
        <Modal
          open={!!editingFeesRates}
          onCancel={() => setEditingFeesRates(null)}
          title="Cập nhật Phí COD"
          width={500}
          footer={[
            <Button key="cancel" onClick={() => setEditingFeesRates(null)}>Hủy</Button>,
            <Button key="submit" type="primary" onClick={() => {
              console.log("Save fees & rates:", editingFeesRates);
              toast.success("Đã lưu phí COD");
              setEditingFeesRates(null);
            }}>Lưu</Button>,
          ]}
        >
          <Form layout="vertical" className="py-4">
            <Form.Item label="COD (Nhật)">
              <Select
                value={editingFeesRates.codOption}
                onChange={(value) => setEditingFeesRates({...editingFeesRates, codOption: value})}
                placeholder="Chọn loại COD"
              >
                <Select.Option value="free">Miễn phí vận chuyển</Select.Option>
                <Select.Option value="admin_cod">Admin điền phí COD</Select.Option>
              </Select>
            </Form.Item>

            {editingFeesRates.codOption === "admin_cod" && (
              <Form.Item label="Phí COD">
                <Input
                  type="number"
                  value={editingFeesRates.codAmount}
                  onChange={(e) => setEditingFeesRates({...editingFeesRates, codAmount: e.target.value})}
                  placeholder="Nhập phí COD"
                  suffix="¥"
                />
              </Form.Item>
            )}
          </Form>
        </Modal>
      )}

      {/* Modal Edit Note Extra */}
      {editingNoteExtra && (
        <Modal
          open={!!editingNoteExtra}
          onCancel={() => setEditingNoteExtra(null)}
          title="Cập nhật Ghi Chú"
          width={500}
          footer={[
            <Button key="cancel" onClick={() => setEditingNoteExtra(null)}>Hủy</Button>,
            <Button key="submit" type="primary" onClick={() => {
              console.log("Save note extra:", editingNoteExtra);
              toast.success("Đã lưu ghi chú");
              setEditingNoteExtra(null);
            }}>Lưu</Button>,
          ]}
        >
          <Form layout="vertical" className="py-4">
            <Form.Item label="Ghi Chú">
              <Input.TextArea
                rows={4}
                value={editingNoteExtra.value}
                onChange={(e) => setEditingNoteExtra({...editingNoteExtra, value: e.target.value})}
                placeholder="Nhập ghi chú"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}

// Modal Edit Tracking Component
function EditTrackingModal({
  open,
  onClose,
  initialData,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialData: {
    orderId: number;
    records: Array<{tracking: string, packageCode: string, quantity: number, weight: string}>
  };
  onSave: (data: Array<{tracking: string, packageCode: string, quantity: number, weight: string}>) => void;
}) {
  const [records, setRecords] = React.useState(initialData.records);

  const handleAddRecord = () => {
    setRecords([...records, { tracking: "", packageCode: "", quantity: 0, weight: "" }]);
  };

  const handleRemoveRecord = (index: number) => {
    const newRecords = [...records];
    newRecords.splice(index, 1);
    setRecords(newRecords);
  };

  const handleRecordChange = (index: number, field: string, value: any) => {
    const newRecords = [...records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setRecords(newRecords);
  };

  const handleGeneratePackageCode = (index: number) => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const code = `T${month}nt${Math.floor(Math.random() * 1000)}`;
    handleRecordChange(index, "packageCode", code);
  };

  const handleSubmit = () => {
    onSave(records);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Cập nhật Tracking / Kiện / Số lượng / Cân nặng"
      width={800}
      centered
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Lưu
        </Button>,
      ]}
    >
      <div className="space-y-3 py-4">
        {/* Header như Excel */}
        <div className="grid grid-cols-[40px_200px_180px_100px_100px_50px] gap-2 bg-gray-100 p-2 rounded font-medium text-xs text-gray-700">
          <div className="text-center">#</div>
          <div>Mã Tracking</div>
          <div>Mã Kiện</div>
          <div className="text-center">Số Kiện</div>
          <div className="text-center">Cân Nặng</div>
          <div></div>
        </div>

        {/* Rows như Excel */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {records.map((record, index) => (
            <div
              key={index}
              className="grid grid-cols-[40px_200px_180px_100px_100px_50px] gap-2 items-center p-2 bg-white border rounded hover:bg-gray-50"
            >
              {/* STT */}
              <div className="text-center text-xs text-gray-600 font-medium">
                {index + 1}
              </div>

              {/* Mã Tracking */}
              <Input
                value={record.tracking}
                onChange={(e) => handleRecordChange(index, "tracking", e.target.value)}
                placeholder="Mã tracking"
                size="small"
                className="text-xs"
              />

              {/* Mã Kiện với icon Gen bên trong */}
              <Input
                value={record.packageCode}
                onChange={(e) => handleRecordChange(index, "packageCode", e.target.value)}
                placeholder="Mã kiện"
                size="small"
                className="text-xs"
                suffix={
                  <ReloadOutlined
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    onClick={() => handleGeneratePackageCode(index)}
                    title="Generate mã kiện"
                  />
                }
              />

              {/* Số Kiện */}
              <Input
                type="number"
                value={record.quantity}
                onChange={(e) => handleRecordChange(index, "quantity", Number(e.target.value))}
                placeholder="0"
                size="small"
                className="text-xs text-center"
              />

              {/* Cân Nặng */}
              <Input
                value={record.weight}
                onChange={(e) => handleRecordChange(index, "weight", e.target.value)}
                placeholder="3.5kg"
                size="small"
                className="text-xs"
              />

              {/* Delete Button */}
              {records.length > 1 && (
                <Button
                  danger
                  size="small"
                  onClick={() => handleRemoveRecord(index)}
                  className="!px-2"
                  title="Xóa"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add Record Button */}
        <Button
          type="dashed"
          onClick={handleAddRecord}
          icon={<PlusOutlined />}
          className="w-full"
          size="small"
        >
          Thêm dòng mới
        </Button>
      </div>
    </Modal>
  );
}
