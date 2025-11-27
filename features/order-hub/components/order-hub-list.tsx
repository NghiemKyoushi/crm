import React, { useEffect, useState, useRef } from "react";
import {
  Tag,
  Button,
  Modal,
  Tooltip,
  Form,
  Input,
  Select,
  InputNumber,
  Dropdown,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, ExclamationCircleOutlined, DownOutlined } from "@ant-design/icons";
import CreateOrderModal from "./modal/add-orderhub-modal";
import OrderHubFilter, { FilterType } from "./order-hub-filter";
import { useTranslation } from "react-i18next";
import {
  extractPathId,
  useApproveOrder,
  useCancelOrder,
  useCancelOrderAfterApprove,
  useCheckOrder,
  useCompleteOrder,
  useListOrder,
  usePurchaseOrder,
  useTrackingOrder,
  useTrackingOrderVN,
  useUpdateCodForEarchOrder,
  useUpdateNoteOrder,
  useUpdateNoteOrderClient,
  useUpdateTrackingOrder,
} from "../hooks/orderhub";
import { ApproveOrderModel, Invoice, OrderStatusType } from "@/types/orderhub";
import TableComponent from "@/components/TableComponent";
import ApproveOrderModal from "./modal/approve-order-modal";
import CheckOrderModal from "./modal/check-order-modal";
import TrackingModal from "./modal/tracking-modal";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import PopupConfirm from "@/components/PopupConfirm";
import CancelReasonModal from "@/features/finance-manage/components/tabs/deposit/modal/modal-cancel-statement";
// import TrackingModalJP from "./modal/tracking-modal-jp";
import EditOrderModal from "./modal/edit-order-modal";
import EnhancedTableWrapper from "@/components/EnhancedTableWrapper";
import NoteModal from "./modal/update-note-modal";
import { EditTrackingModal } from "./modal/edit-tracking-modal";
import { usePermission } from "@/components/layout/PermissionContext";
import {
  updateKuponOrder,
  getSourceWebsiteByDomain,
  getWebsiteAccounts,
  updateOrderSourceAccount,
} from "../apis/orderhub";
import dayjs from "dayjs";
import { CancelOrderModal } from "./modal/cancel-order-modal";

function isEqualObject(obj1: any, obj2: any) {
  // Only compare shallow, including only relevant keys
  const keys = Object.keys({ ...obj1, ...obj2 });
  for (const key of keys) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

export default function OrderHub() {
  const { hasPermission, permissions } = usePermission();
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
  const [isEditingTrackingModal, setIsEditingTrackingModal] = useState(false);
  const [isTrackingJP, setIsTrackingJP] = useState(false);
  const [isOpenCancelOrder2, setIsOpenCancelOrder2] = useState(false);

  const [isEditingTracking, setIsEditingTracking] = useState<{
    orderId: number;
    records: Array<{
      tracking: string;
      packageCode: string;
      quantity: number;
      weight: string;
    }>;
  } | null>(null);

  // Edit modal states
  const [editingNote, setEditingNote] = useState<{
    id: number;
    note: string;
  } | null>(null);
  const [editingFeesRates, setEditingFeesRates] = useState<{
    orderId: number;
    codOption: number;
    codAmount: string;
  } | null>(null);
  const [editingNoteExtra, setEditingNoteExtra] = useState<{
    orderId: number;
    value: string;
  } | null>(null);
  // --- Kupon Edit State
  const [editingKupon, setEditingKupon] = useState<{
    orderId: number;
    value: number | null;
  } | null>(null);
  const [isKuponLoading, setIsKuponLoading] = useState<boolean>(false);

  // Account management states
  const [orderAccounts, setOrderAccounts] = useState<
    Record<number, Array<{ id: number; username: string }>>
  >({});
  const [loadingAccounts, setLoadingAccounts] = useState<
    Record<number, boolean>
  >({});
  const [orderSourceAccount, setOrderSourceAccount] = useState<
    Record<number, number | null>
  >({});
  // Track which orders are being loaded to prevent duplicate calls
  const loadingOrdersRef = useRef<Set<number>>(new Set());
  // Track dropdown open state for each order
  const [dropdownOpenStates, setDropdownOpenStates] = useState<Record<number, boolean>>({});

  const [filters, setFilters] = useState<FilterType>({
    status: undefined,
    // date: undefined,
    customer_name: undefined,
    product_url: undefined,
    product_name: undefined,
    invoice_no: undefined,
    tracking_code: undefined,
    package_code: undefined,
    product_id: undefined,
    note_admin: undefined,
    from_date: undefined,
    to_date: undefined,
  });
  // Track the previous filters to know if filters changed
  const prevFilters = useRef<FilterType>(filters);

  // Lưu ý: useListOrder chạy lại khi filters hoặc page thay đổi; không cần thay đổi ở đây.
  // Utility: Remove keys with value undefined
  const removeUndefinedFields = (obj: any) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined)
    );
  };

  const { data: listOrder, isPending } = useListOrder(
    removeUndefinedFields({
      page,
      size: 10,
      status: filters.status,
      // date: filters.date,
      customer_name: filters.customer_name,
      product_url: filters.product_url,
      product_name: filters.product_name,
      invoice_no: filters.invoice_no,
      tracking_code: filters.tracking_code,
      package_code: filters.package_code,
      product_id: filters.product_id,
      note_admin: filters.note_admin,
      from_date: filters.from_date,
      to_date: filters.to_date,
      customer_code: filters.customer_code,
      email: filters.email,
      phone_number: filters.phone_number,
    })
  );
  const approveMutation = useApproveOrder();
  const useCancelMutation = useCancelOrder();
  const purchaseMutation = usePurchaseOrder();
  const trackingJPMutation = useTrackingOrder();
  const trackingVNMutation = useTrackingOrderVN();
  const checkOrderVNMutation = useCheckOrder();
  const useCompleteMutation = useCompleteOrder();
  const useAddNote = useUpdateNoteOrder();
  const useAddNoteClient = useUpdateNoteOrderClient();
  const useUpdateOrderTracking = useUpdateTrackingOrder();
  const queryClient = useQueryClient();
  const updateCodForEarchOrderMutation = useUpdateCodForEarchOrder();
  const cancelOrderAfterApproveMutation = useCancelOrderAfterApprove();

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

  const handleCheckOrder = async (valueForm: any) => {
    if (!orderDetail) return;
    const { records, form } = valueForm;
    try {
      await Promise.all([
        new Promise((resolve, reject) => {
          useUpdateOrderTracking.mutate(
            {
              body: records,
              id: orderDetail.id,
            },
            {
              onSuccess: () => resolve(true),
              onError: (err: any) => reject(err),
            }
          );
        }),
        new Promise((resolve, reject) => {
          checkOrderVNMutation.mutate(
            {
              body: {
                description: form.note,
                weight: form.actualWeight,
                weight_fee: form.feePerKg || 0,
              },
              id: orderDetail.id.toString(),
            },
            {
              onSuccess: () => resolve(true),
              onError: (err: any) => reject(err),
            }
          );
        }),
      ]);
      toast.success("Cập nhật tracking và kiểm tra hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["listorder"] });
      setIsEditingTrackingModal(false);
      setIsOpenCheckOrder(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.localizedMessage || t("common.error"));
    }
  };

  // We use a 'didSetInitialType' to only set filter.type once.
  const didSetInitialType = useRef(false);

  useEffect(() => {
    if (!didSetInitialType.current) {
      if (
        hasPermission("sales.view_assigned_orders") &&
        hasPermission("order.view")
      ) {
        setFilters((prev) => ({ ...prev, type: 1 }));
      } else {
        setFilters((prev) => ({ ...prev, type: 2 }));
      }
      didSetInitialType.current = true;
    }
    // eslint-disable-next-line
  }, [permissions]);

  // handleFilter: Only set filters and reset to page 1 if something actually changed
  const handleFilter = (newFilters: FilterType) => {
    console.log('handleFilter', newFilters);

    if (isEqualObject(newFilters, prevFilters.current)) {
      return;
    }
    prevFilters.current = newFilters;
    setFilters(newFilters);
    setPage(0);
  };


  // Function to call for updating kupon (with toast and loading)
  const updateOrderKupon = async (orderId: number, value: number | null) => {
    setIsKuponLoading(true);
    try {
      await updateKuponOrder(orderId, { kupon: value ?? 0 });
      toast.success("Cập nhật kupon thành công");
      setEditingKupon(null);
      queryClient.invalidateQueries({
        queryKey: ["listorder"],
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.localizedMessage || "Có lỗi khi cập nhật kupon"
      );
    } finally {
      setIsKuponLoading(false);
    }
  };

  // Extract domain from URL
  const extractDomain = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  };

  // Load accounts for an order when select dropdown is opened
  // If source_website_id exists, use it directly
  // If source_website_id is null, extract domain from URL and search for website
  const loadAccountsForOrder = async (order: Invoice) => {
    // Prevent duplicate calls
    if (loadingOrdersRef.current.has(order.id)) {
      return; // Currently loading
    }

    loadingOrdersRef.current.add(order.id);
    setLoadingAccounts((prev) => ({ ...prev, [order.id]: true }));
    try {
      let websiteId: number;

      // If source_website_id exists, use it directly
      if (order.source_website_id != null) {
        websiteId = order.source_website_id;
      } else {
        // Fallback to old logic: extract domain from URL and search for website
        const url = order.metadata?.items?.[0]?.product?.url;
        const domain = extractDomain(url);

        if (!domain) {
          setLoadingAccounts((prev) => ({ ...prev, [order.id]: false }));
          loadingOrdersRef.current.delete(order.id);
          toast.error("Không tìm thấy domain từ URL");
          return;
        }

        // Search website by domain
        const websiteResponse = await getSourceWebsiteByDomain(domain);
        const websites = websiteResponse?.data || [];
        const website = websites.find(
          (w: any) => w.domain === domain || w.domain?.includes(domain)
        );

        if (!website?.id) {
          setLoadingAccounts((prev) => ({ ...prev, [order.id]: false }));
          loadingOrdersRef.current.delete(order.id);
          toast.error("Không tìm thấy website");
          return;
        }

        websiteId = website.id;
      }

      // Get accounts for this website
      const accounts = await getWebsiteAccounts(websiteId);
      console.log(`Loaded accounts for order ${order.id}:`, accounts);
      // Store accounts in state - will be automatically mapped to Select.Option in render
      setOrderAccounts((prev) => {
        const newState = { ...prev, [order.id]: accounts || [] };
        console.log(`Updated orderAccounts for order ${order.id}:`, newState[order.id]);
        return newState;
      });
    } catch (error: any) {
      console.error("Failed to load accounts:", error);
      toast.error("Không thể tải danh sách account");
    } finally {
      setLoadingAccounts((prev) => ({ ...prev, [order.id]: false }));
      loadingOrdersRef.current.delete(order.id);
    }
  };

  // Handle account selection
  const handleAccountChange = async (orderId: number, accountId: number) => {
    try {
      await updateOrderSourceAccount(orderId, accountId);
      setOrderSourceAccount((prev) => ({ ...prev, [orderId]: accountId }));
      toast.success("Cập nhật account thành công");
      queryClient.invalidateQueries({
        queryKey: ["listorder"],
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.localizedMessage || "Có lỗi khi cập nhật account"
      );
    }
  };

  const handleCancelOrderAfterApprove = (
    orderId: number,
    params: {
      amount: number;
      note: string;
      isFullBack: boolean;
    }
  ) => {
    cancelOrderAfterApproveMutation.mutate(
      {
        id: orderId,
        body: { ...params },
      },
      {
        onSuccess: () => {
          toast.success("Huỷ đơn hàng thành công");
          queryClient.invalidateQueries({
            queryKey: ["listorder"],
          });
          setOrderDetail(undefined);
          setIsOpenCancelOrder2(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.localizedMessage || "Có lỗi xảy ra"
          );
        },
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
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_: string, record: any) => (
        <div>
          <div className="text-xs font-medium text-blue-600">
            {record.invoice_no || "Cập nhật sau"}
          </div>
          <div className="text-xs text-gray-400">
            {record.created_at
              ? dayjs(record.created_at).format("DD/MM/YYYY")
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Tracking / Kiện / SL / CN",
      key: "tracking_package",
      width: 200,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        const trackingRecords = record.tracking_ship_list || [];
        const firstRecord = trackingRecords[0];

        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 min-w-0">
                {firstRecord ? (
                  <>
                    <div className="text-xs truncate">
                      <span className="text-gray-500">Track: </span>
                      <span className="text-gray-800">
                        {firstRecord.tracking_code || "-"}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Kiện: </span>
                      <span className="text-gray-800">
                        {firstRecord.package_code || "-"}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">SL: </span>
                      <span className="text-gray-800">
                        {firstRecord.package_number > 0
                          ? firstRecord.package_number
                          : "-"}
                      </span>
                      <span className="text-gray-500"> | CN: </span>
                      <span className="text-gray-800">
                        {firstRecord.weight || "-"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">Cập nhật sau</div>
                )}
              </div>
              {record.status !== OrderStatusType.PENDING_PAYMENT &&
                record.status !== OrderStatusType.READY_TO_SHIP &&
                hasPermission("order.edit") && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined className="text-xs" />}
                    className="!p-0 !h-auto flex-shrink-0"
                    onClick={() => {
                      setIsEditingTrackingModal(true);
                      setOrderDetail(record);
                    }}
                  />
                )}
            </div>
            {trackingRecords.length > 1 && (
              <Button
                type="link"
                size="small"
                className="!p-0 !h-auto !text-xs"
                onClick={() => {
                  setIsEditingTrackingModal(true);
                  setOrderDetail(record);
                }}
              >
                +{trackingRecords.length - 1} mục khác
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Giá SP",
      key: "product",
      width: 280,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        const product = record.metadata?.items?.[0]?.product;
        const name = product?.map_data?.productName || "-";
        const price = product?.map_data?.price;
        const url = product?.url || null;
        const images = product?.map_data?.images || [];
        const thumbnail = images[0] || null;
        const shippingFee = record.metadata.infos?.codInJapan ?? 0;
        const isJapanPrice =
          record.metadata.items?.[0]?.product?.currency_code === "JPY"
            ? "¥"
            : "$";
        const codeType = record.metadata.infos?.codeType ?? null;
        const isPendingApproval =
          record.status === OrderStatusType.PENDING_APPROVAL;
        const shouldShowWarning = isPendingApproval && !shippingFee;
        return (
          <div className="flex gap-2">
            {thumbnail && (
              <img
                src={thumbnail}
                alt={name}
                className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/48?text=No+Image";
                }}
              />
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs text-gray-800 line-clamp-2">{name}</div>
              <div className="text-xs">
                <span className="text-gray-500">Giá: </span>
                <span className="text-green-600 font-medium">
                  {price && !isNaN(Number(price))
                    ? `${isJapanPrice}${Number(price).toLocaleString("ja-JP")}`
                    : "-"}
                </span>
              </div>
              <div className="text-xs">
                <div className="text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Cước vc: </span>
                    {shouldShowWarning ? (
                      <Tooltip title="Chưa có phí COD">
                        <ExclamationCircleOutlined
                          className="text-amber-500 text-sm cursor-help"
                          style={{ color: "#f59e0b" }}
                        />
                      </Tooltip>
                    ) : (
                      <span className="text-gray-800">
                        {shippingFee
                          ? `${shippingFee.toLocaleString(
                            "en-US"
                          )}${isJapanPrice}`
                          : codeType === 1
                            ? "Miễn phí"
                            : codeType === 3
                              ? "Cập nhật sau"
                              : "-"}
                      </span>
                    )}
                  </div>
                  {codeType !== 1 &&
                    codeType !== 2 &&
                    hasPermission("order.edit") && (
                      <EditOutlined
                        className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0"
                        onClick={() => {
                          const codeType =
                            record.metadata?.infos?.codeType ?? null;
                          const codInJapan =
                            record.metadata?.infos?.codInJapan ?? null;
                          setOrderDetail(record);
                          setEditingFeesRates({
                            orderId: record.id,
                            codOption: codeType ?? 1,
                            codAmount: codInJapan ?? "",
                          });
                        }}
                      />
                    )}
                </div>
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline inline-block"
                >
                  {extractPathId(url)}
                </a>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Ghi Chú",
      key: "note",
      width: 140,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="flex items-center justify-between gap-2 h-full">
          <div className="text-xs text-gray-600 line-clamp-2 flex-1">
            {record.note || record.description || "Cập nhật sau"}
          </div>
          {hasPermission("order.edit") && (
              <EditOutlined
                className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0 self-center"
                onClick={() =>
                  setEditingNote({
                    id: record.id,
                    note: record.note || record.description || "",
                  })
                }
              />
            )}
        </div>
      ),
    },
    {
      title: "Kupon",
      key: "kupon",
      width: 110,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="flex items-center gap-2 justify-between">
          <span className="text-xs text-gray-800 text-left">
            {typeof record.kupon === "number"
              ? record.kupon.toLocaleString("en-US")
              : record.kupon && !isNaN(Number(record.kupon))
                ? Number(record.kupon).toLocaleString("en-US")
                : "-"}
          </span>
          {hasPermission("order.edit") && (
              <EditOutlined
                className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0"
                onClick={() => {
                  setEditingKupon({
                    orderId: record.id,
                    value:
                      typeof record.kupon === "number"
                        ? record.kupon
                        : record.kupon && !isNaN(Number(record.kupon))
                          ? Number(record.kupon)
                          : null,
                  });
                  setOrderDetail(record);
                }}
              />
            )}
        </div>
      ),
    },
    {
      title: "Thanh Toán & Công Nợ",
      key: "payment_info",
      width: 170,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        const depositFee = record.deposit_fee ?? 0;
        const totalAmount = record.amount_vnd ?? 0;
        const remaining = totalAmount - depositFee;

        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="text-gray-500">Trước: </span>
              <span className="text-green-600 font-medium">
                {record.deposit_fee || record.deposit_fee === 0
                  ? `${record.deposit_fee.toLocaleString("en-US")}đ`
                  : "Cập nhật sau"}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Lần 2: </span>
              <span className="text-orange-600 font-medium">
                {remaining > 0
                  ? `${remaining.toLocaleString("en-US")}đ`
                  : "Cập nhật sau"}
              </span>
            </div>
          </div>
        );
      },
    },
    // {
    //   title: "COD (Việt)",
    //   key: "transfer_fee",
    //   width: 180,
    //   onCell: () => ({
    //     style: {
    //       borderRight: "1px solid #f0f0f0",
    //     },
    //   }),
    //   render: (_, record) => {
    //     const shippingCode = record.tracking_vn || "-";
    //     const codShippingPrice = record.shipping_fee || 0;
    //     const shippingPrice = codShippingPrice || record.shipping_fee || 0;

    //     const isCOD = codShippingPrice > 0;
    //     const shippingTypeText = isCOD ? "COD" : "-";
    //     const shippingTypeColor = isCOD ? "text-blue-600" : "text-gray-600";

    //     return (
    //       <div className="space-y-1">
    //         <div className="text-xs">
    //           <span className="text-gray-500">Mã: </span>
    //           <span className="text-gray-800">{record?.final_tracking}</span>
    //         </div>
    //         <div className="text-xs">
    //           <span className="text-gray-500">Giá: </span>
    //           <span className="text-gray-800 font-medium">
    //             {shippingPrice > 0
    //               ? `${shippingPrice.toLocaleString("en-US")}đ`
    //               : "Cập nhật sau"}
    //           </span>
    //         </div>
    //         <div className="text-xs">
    //           <span className="text-gray-500">HT: </span>
    //           <span className={`font-medium ${shippingTypeColor}`}>
    //             {shippingTypeText}
    //           </span>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Tổng chi phí",
      key: "total",
      width: 110,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="text-xs font-medium text-blue-600">
          {record.amount_vnd
            ? `${record.amount_vnd.toLocaleString("en-US")}đ`
            : "Cập nhật sau"}
        </div>
      ),
    },
    {
      title: "Ghi Chú (Admin)",
      key: "note_admin",
      width: 140,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="flex items-center justify-between gap-2 h-full">
          <div className="text-xs text-gray-600 flex-1">
            {record?.note_admin ? record?.note_admin : "Cập nhật sau"}
          </div>
          {hasPermission("order.edit") && (
              <EditOutlined
                className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0"
                onClick={() =>
                  setEditingNoteExtra({
                    orderId: record.id,
                    value: record?.note_admin,
                  })
                }
              />
            )}
        </div>
      ),
    },
    {
      title: "Account",
      key: "account",
      width: 150,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        const accounts = orderAccounts[record.id] || [];
        const isLoading = loadingAccounts[record.id];

        // Use source_account_id and source_account_username directly from order data
        const currentAccountId = orderSourceAccount[record.id] ?? record.source_account_id;
        const currentAccountUsername = record.source_account_username;

        const isDropdownOpen = dropdownOpenStates[record.id] || false;

        // Handle dropdown open - load accounts immediately when clicked
        const handleDropdownOpen = (open: boolean) => {
          setDropdownOpenStates((prev) => ({ ...prev, [record.id]: open }));

          if (open && !orderAccounts[record.id] && !loadingOrdersRef.current.has(record.id)) {
            loadAccountsForOrder(record);
          }
        };

        return (
          <Dropdown
            open={isDropdownOpen}
            dropdownRender={() => (
              <div className="bg-white border border-gray-200 rounded shadow-lg min-w-[150px] max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Spin size="small" />
                    <span className="ml-2 text-xs text-gray-400">Đang tải...</span>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-xs text-gray-400 py-4 text-center">Không có account</div>
                ) : (
                  <div>
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className={`text-xs py-2 px-3 hover:bg-gray-100 cursor-pointer transition-colors ${currentAccountId === account.id ? "bg-blue-50 font-medium" : ""
                          }`}
                        onClick={() => {
                          handleAccountChange(record.id, account.id);
                          setDropdownOpenStates((prev) => ({ ...prev, [record.id]: false }));
                        }}
                      >
                        {account.username}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            trigger={["click"]}
            onOpenChange={handleDropdownOpen}
            placement="bottomLeft"
          >
            <Button
              size="small"
              className="w-full !h-auto !text-xs !text-left !flex !items-center !justify-between"
              style={{
                fontSize: 12,
                height: "auto",
                minHeight: 24,
                padding: "2px 8px",
              }}
            >
              <span className="truncate flex-1 text-left">
                {currentAccountUsername || "Chọn account"}
              </span>
              {isLoading ? (
                <Spin size="small" className="ml-2 flex-shrink-0" />
              ) : (
                <DownOutlined className="ml-2 text-xs flex-shrink-0" />
              )}
            </Button>
          </Dropdown>
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
          case OrderStatusType.ADMIN_PENDING:
            color = "orange";
            text = t("status.approve");
            break;
          case OrderStatusType.CLIENT_PENDING:
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
          case OrderStatusType.DENIED:
            color = "red";
            text = t("status.denied");
            break;
          case OrderStatusType.PACKED:
            color = "green";
            text = t("status.packed");
            break;
          default:
            color = "default";
            text = status;
        }

        let actionButton: React.ReactNode = null;

        // Check permissions
        const canUpdateStatus = hasPermission("order.update_status"); // Duyệt đơn
        const canReject = hasPermission("order.cancel"); // Từ chối đơn (ADMIN_PENDING)
        const canDelete = hasPermission("order.delete"); // Huỷ đơn (các status khác)

        switch (record.status) {
          case OrderStatusType.ADMIN_PENDING:
            actionButton = (
              <div className="flex gap-1.5 justify-center w-full">
                {canUpdateStatus && (
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
                )}
                {canReject && (
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
                )}
              </div>
            );
            break;

          case OrderStatusType.DEPOSIT_PAID:
            actionButton = (
              <div className="flex gap-1.5 justify-center w-full">
                {canUpdateStatus && (
                  <Button
                    key={record.status}
                    size="small"
                    onClick={() => {
                      setOrderDetail(record);
                      setOpenConfirmPurchase(true);
                    }}
                    className="!bg-blue-500 hover:!bg-blue-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                  >
                    🛒 Đã mua
                  </Button>
                )}
                {canDelete && (
                  <Button
                    key={record.status}
                    size="small"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsOpenCancelOrder2(true);
                    }}
                    className="!bg-red-500 hover:!bg-red-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                  >
                    Huỷ đơn
                  </Button>
                )}
              </div>
            );
            break;

          case OrderStatusType.PURCHASED:
            actionButton = (
              <div className="flex gap-1.5 justify-center w-full">
                {canUpdateStatus && (
                  <Button
                    key={record.status}
                    size="small"
                    className="!bg-purple-500 hover:!bg-purple-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsTrackingJP(true);
                      setIsEditingTrackingModal(true);
                      // setIsOpenTrackingOrder()
                    }}
                  >
                    {/* 🏢 Kho JP */}
                    Vận chuyển
                  </Button>
                )}
                {canDelete && (
                  <Button
                    key={record.status}
                    size="small"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsOpenCancelOrder2(true);
                    }}
                    className="!bg-red-500 hover:!bg-red-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                  >
                    Huỷ đơn
                  </Button>
                )}
              </div>
            );
            break;

          case OrderStatusType.ARRIVED_JP_WAREHOUSE:
            actionButton = (
              <div className="flex gap-1.5 justify-center w-full">
                {canUpdateStatus && (
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
                    {/* 🏭 Kho VN */}
                    Vc nước ngoài
                  </Button>
                )}
                {canDelete && (
                  <Button
                    key={record.status}
                    size="small"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsOpenCancelOrder2(true);
                    }}
                    className="!bg-red-500 hover:!bg-red-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                  >
                    Huỷ đơn
                  </Button>
                )}
              </div>
            );
            break;

          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            actionButton = (
              <div className="flex gap-1.5 justify-center w-full">
                {canUpdateStatus && (
                  <Button
                    key={record.status}
                    size="small"
                    className="!bg-cyan-600 hover:!bg-cyan-700 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsOpenCheckOrder(true);
                    }}
                  >
                    {/* 📦 Kiểm hàng */}
                    Kho VN
                  </Button>
                )}
                {canDelete && (
                  <Button
                    key={record.status}
                    size="small"
                    onClick={() => {
                      setOrderDetail(record);
                      setIsOpenCancelOrder2(true);
                    }}
                    className="!bg-red-500 hover:!bg-red-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                  >
                    Huỷ đơn
                  </Button>
                )}
              </div>
            );
            break;

          case OrderStatusType.READY_TO_SHIP:
            break;

          case OrderStatusType.PACKED:
            break;
        }

        return (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            {/* Tag trạng thái */}
            <Tag
              color={color}
              className="!text-[11px] m-0 !py-1 !px-2 !leading-4 !font-medium"
              style={{
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minWidth: "100px",
                height: "22px",
                borderRadius: "4px",
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

  return (
    <div className=" bg-gray-50 ">
      <div className="bg-white rounded-xl shadow p-6">
        <OrderHubFilter
          onFilter={handleFilter}
          onCreateOrder={() => setOpen(true)}
          initialFilters={filters}
          canCreate={hasPermission("order.create")}
        />

        <EnhancedTableWrapper
        //  className="overflow-x-auto"
        >
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
            loading={isPending}
          />
        </EnhancedTableWrapper>
      </div>
      <CreateOrderModal
        isOpen={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
      {orderDetail && openDetail && (
        <EditOrderModal
          isOpen={openDetail}
          onCancel={() => {
            setOpenDetail(false);
            setOrderDetail(undefined);
          }}
          orderId={+orderDetail?.id}
          onConfirm={() => console.log()}
        />
      )}

      {orderDetail && (
        <ApproveOrderModal
          open={isOpenApproveOrder}
          customerName={
            orderDetail?.customer_name ? orderDetail?.customer_name : ""
          }
          orderDetail={orderDetail}
          orderCode={orderDetail.invoice_no ? orderDetail.invoice_no : ""}
          onCancel={() => {
            setIsOpenApproveOrder(false);
            setOrderDetail(undefined);
          }}
          onSubmit={(data: ApproveOrderModel) => {
            approveMutation.mutate(
              {
                body: {
                  ...data,
                  cod_shipping_price: data.cod_shipping_price,
                },
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
          // feePerKg={10}
          // onClose={}
          onClose={() => {
            setOrderDetail(undefined);
            setIsOpenCheckOrder(false);
          }}
          onSubmit={handleCheckOrder}
          orderCode={orderDetail.invoice_no}
          customerId={orderDetail.id}
          productName={
            orderDetail?.metadata?.items[0]?.product?.map_data?.productName
          }
          orderId={orderDetail.id}
          status={orderDetail.status}
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
          onClose={() => {
            setOrderDetail(undefined);
            setIsOpenCancel(false);
          }}
          open={isOpenCancel}
          onConfirm={handleCancel}
        />
      )}

      {/* Modal Edit Tracking/Kiện/SL/CN */}
      {orderDetail && (
        <EditTrackingModal
          orderId={orderDetail.id}
          open={isEditingTrackingModal}
          status={orderDetail.status}
          onClose={() => {
            setOrderDetail(undefined);
            setIsTrackingJP(false);
            setIsEditingTrackingModal(false);
          }}
          onSave={async (records) => {
            const promises = [];
            const updatePromise = useUpdateOrderTracking.mutateAsync({
              body: records,
              id: orderDetail.id,
            });
            promises.push(updatePromise);
            if (isTrackingJP) {
              const jpPromise = trackingJPMutation.mutateAsync({
                id: orderDetail.id.toString(),
              });
              promises.push(jpPromise);
            }
            Promise.all(promises)
              .then(() => {
                toast.success("Cập nhật thành công!");
                queryClient.invalidateQueries({ queryKey: ["listorder"] });
                setIsEditingTrackingModal(false);
                setIsOpenTrackingOrder(false);
                setIsEditingTracking(null);
              })
              .catch((err) => {
                toast.error(
                  err.response?.data?.localizedMessage || t("common.error")
                );
              });
            setIsEditingTracking(null);
            setIsTrackingJP(false);
            queryClient.invalidateQueries({ queryKey: ["listorder"] });
          }}
        />
      )}

      {/* Modal Edit Note */}
      {editingNote && (
        <NoteModal
          open={!!editingNote}
          note={editingNote?.note}
          onCancel={() => {
            setEditingNote(null);
            setOrderDetail(undefined);
          }}
          onSave={(note) => {
            useAddNoteClient.mutate(
              {
                id: editingNote.id,
                param: {
                  note: note,
                },
              },
              {
                onSuccess: () => {
                  toast.success("Update ghi chú ADMIN thành công");
                  queryClient.invalidateQueries({
                    queryKey: ["listorder"],
                  });
                  setEditingNote(null);
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

      {/* Modal Edit Kupon */}
      {editingKupon && (
        <Modal
          open={!!editingKupon}
          onCancel={() => setEditingKupon(null)}
          title="Thêm kupon"
          width={400}
          centered
          footer={[
            <Button key="cancel" onClick={() => setEditingKupon(null)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isKuponLoading}
              onClick={() =>
                updateOrderKupon(editingKupon.orderId, editingKupon.value)
              }
            >
              Lưu
            </Button>,
          ]}
        >
          <Form layout="vertical" className="py-4">
            <Form.Item label="Kupon">
              <InputNumber
                value={editingKupon.value ?? 0}
                onChange={(num) => {
                  setEditingKupon({
                    ...editingKupon,
                    value: num === null || num === undefined ? null : num,
                  });
                }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                placeholder="Nhập số kupon"
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Modal Edit Fees & Rates */}
      {editingFeesRates && orderDetail && (
        <Modal
          open={!!editingFeesRates}
          onCancel={() => {
            setEditingNote(null);
            // setEditingFeesRates(null);
            setOrderDetail(undefined);
          }}
          title="Cập nhật Phí COD"
          width={500}
          centered
          footer={[
            <Button key="cancel" onClick={() => setEditingFeesRates(null)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                updateCodForEarchOrderMutation.mutate(
                  {
                    id: orderDetail?.id,
                    param: {
                      cod_shipping_price: +editingFeesRates.codAmount,
                      cod_type: editingFeesRates.codOption,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Đã lưu phí COD");
                      queryClient.invalidateQueries({
                        queryKey: ["listorder"],
                      });
                      setEditingNote(null);
                    },
                    onError: (err: any) =>
                      toast.error(
                        err.response?.data?.localizedMessage ||
                        t("common.error")
                      ),
                  }
                );
                console.log("Save fees & rates:", editingFeesRates);
                setEditingFeesRates(null);
              }}
            >
              Lưu
            </Button>,
          ]}
        >
          <Form layout="vertical" className="py-4">
            <Form.Item label="VC (Nhật)">
              <Select
                value={editingFeesRates.codOption}
                onChange={(value) =>
                  setEditingFeesRates({ ...editingFeesRates, codOption: value })
                }
                placeholder="Chọn loại COD"
              >
                <Select.Option value={1}>Miễn phí</Select.Option>
                <Select.Option value={2}>Có phí</Select.Option>
                <Select.Option value={3}>Cập nhật sau</Select.Option>
              </Select>
            </Form.Item>

            {editingFeesRates.codOption === 2 && (
              <Form.Item label="Phí COD">
                <Input
                  type="number"
                  value={editingFeesRates.codAmount}
                  onChange={(e) =>
                    setEditingFeesRates({
                      ...editingFeesRates,
                      codAmount: e.target.value,
                    })
                  }
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
          centered
          footer={[
            <Button key="cancel" onClick={() => setEditingNoteExtra(null)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                useAddNote.mutate(
                  {
                    order_id: editingNoteExtra.orderId,
                    param: {
                      note: editingNoteExtra.value,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Update ghi chú ADMIN thành công");
                      queryClient.invalidateQueries({
                        queryKey: ["listorder"],
                      });
                      setEditingNote(null);
                    },
                    onError: (err: any) =>
                      toast.error(
                        err.response?.data?.localizedMessage ||
                        t("common.error")
                      ),
                  }
                );
                setEditingNoteExtra(null);
              }}
            >
              Lưu
            </Button>,
          ]}
        >
          <Form layout="vertical" className="py-4">
            <Form.Item label="Ghi Chú">
              <Input.TextArea
                rows={4}
                value={editingNoteExtra.value}
                onChange={(e) =>
                  setEditingNoteExtra({
                    ...editingNoteExtra,
                    value: e.target.value,
                  })
                }
                placeholder="Nhập ghi chú"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}

      {orderDetail && (
        <CancelOrderModal
          onCancel={() => {
            setIsOpenCancelOrder2(false);
            setOrderDetail(undefined);
          }}
          onConfirm={(value) =>
            handleCancelOrderAfterApprove(orderDetail.id, value)
          }
          visible={isOpenCancelOrder2}
        />
      )}
    </div>
  );
}

// Modal Edit Tracking Component
