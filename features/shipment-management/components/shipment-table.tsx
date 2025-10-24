"use client";

import React, { useState, useRef } from "react";
import { Form, Input, Button, Tag, DatePicker, Select, Modal, Tooltip, Table } from "antd";
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
import { Order, OrderItem } from "@/types/shipment-manage";
import EnhancedTableWrapper from "@/components/EnhancedTableWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { EyeOutlined, EditOutlined, ExclamationCircleOutlined, DownOutlined } from "@ant-design/icons";
import ShipmentFilter, { FilterTypeShipment } from "./shipment-filter";

// === Utility: Remove undefined fields from object ===
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj) return {};
  const result: Partial<T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key as keyof T] = value;
    }
  });
  return result;
}

/**
 * Compare two filter objects. Return true if they are shallow equal.
 * Note: If a value is array/object reference shallow equality is used.
 */
function shallowEqual(objA: Record<string, any>, objB: Record<string, any>) {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (objA[key] !== objB[key]) return false;
  }
  return true;
}

const ProductManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [orderDetail, setOrderDetail] = useState<Order>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<FilterTypeShipment>({
    search: undefined,
    status: undefined,
    date: undefined,
    customer_name: undefined,
    product_url: undefined,
    product_name: undefined,
    tracking_ship: undefined,
    tracking_code: undefined,
    package_code: undefined,
    product_id: undefined,
    note_admin: undefined,
    from_date: undefined,
    to_date: undefined,
  });

  // Keep previous filter object to detect truthy change (for forcing refresh if object is same keys but values are strictly equal)
  const prevFiltersRef = useRef<FilterTypeShipment>(filters);

  // Khi setFilters, nếu các key/values giống nhau thì vẫn cần force lại API: Chúng ta sẽ tạo ra 1 biến random fakeKey gắn vào params để force react-query gọi lại
  // Hoặc có thể dùng page để force gọi lại, nhưng dễ nhất là có thêm forceKey mỗi lần dùng filter
 
  const [forceFilterKey, setForceFilterKey] = useState<number>(Date.now());

  // Construct query params by removing undefined + add forceFilterKey để trigger refetch
  const filterQueryParams = {
    ...removeUndefinedFields({
      status:
        filters.status ||
        [
          OrderStatusType.ARRIVED_VN_WAREHOUSE,
          OrderStatusType.READY_TO_SHIP,
          OrderStatusType.SHIPPING_REQUEST_CLIENT,
          OrderStatusType.SHIPPED,
        ],
      date: filters.date,
      search: filters.search,
      customer_name: filters.customer_name,
      product_url: filters.product_url,
      product_name: filters.product_name,
      tracking_ship: filters.tracking_ship,
      tracking_code: filters.tracking_code,
      package_code: filters.package_code,
      product_id: filters.product_id,
      note_admin: filters.note_admin,
      from_date: filters.from_date,
      to_date: filters.to_date,
    }),
  };

  const { data: listOrder } = useListOrderTracking({
    page,
    size: 20,
    ...filterQueryParams,
  });

  const [isOpenTrackingOrder, setIsOpenTrackingOrder] = useState(false);

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleFinish = (newFilters: FilterTypeShipment) => {
    // Nếu filter cũ giống filter mới thì vẫn force update bằng cách tăng force key, để gọi lại API
    if (shallowEqual(removeUndefinedFields(filters), removeUndefinedFields(newFilters))) {
      setForceFilterKey(Date.now());
    }
    setFilters(newFilters);
    setPage(1);
    prevFiltersRef.current = newFilters;
  };

  const useCompleteShippingMutation = useCompleteShippingOrder();

  const columns: ColumnsType<Order> = [
    {
      title: "Mã VĐ / SL",
      key: "tracking_ship",
      width: 100,
      align: "center",
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        return (
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-600">{record.tracking_ship}</div>
            <div className="text-xs text-gray-500">
              <span className="font-medium text-orange-600">{record.quantity || record.order_list?.length || 0}</span> đơn
            </div>
          </div>
        );
      },
    },
    {
      title: "Ngày TT",
      key: "payment_created_date",
      width: 80,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
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
      title: "Mã VN / CN",
      key: "tracking_package",
      width: 180,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        const orderList = record.order_list || [];

        // Tính tổng cân nặng từ tất cả orders
        const totalWeight = orderList.reduce((sum, order) => sum + (order.weight || 0), 0);

        // Lấy tất cả tracking_vn
        const trackingVnList = orderList
          .map(order => order.tracking_vn)
          .filter(Boolean);

        const firstTrackingVn = trackingVnList[0] || "-";
        const remainingCount = trackingVnList.length - 1;

        return (
          <div className="space-y-1">
            <div className="text-xs truncate">
              <span className="text-gray-500">Mã VN: </span>
              <span className="text-gray-800">{firstTrackingVn}</span>
            </div>
            {remainingCount > 0 && (
              <div className="text-xs text-blue-600">
                +{remainingCount} mã khác
              </div>
            )}
            <div className="text-xs">
              <span className="text-gray-500">Tổng CN: </span>
              <span className="text-gray-800 font-medium">{totalWeight}kg</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Khách Hàng / NTạo",
      key: "customer_info",
      width: 200,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        const createdByName = record.order_list?.[0]?.created_by_name;
        return (
          <div className="space-y-1">
            <div className="text-xs text-gray-800 font-medium">{record.customer_name || "-"}</div>
            {/* <div className="text-xs text-gray-500">{record.customer_code || "-"}</div> */}
            <div className="text-xs text-blue-600">
              <span className="text-gray-500">NTạo: </span>
              {createdByName || "-"}
            </div>
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
        const orderList = record.order_list || [];
        const addresses = orderList
          .map(order => order.address)
          .filter(Boolean);

        const firstAddress = addresses[0] || "-";
        const uniqueAddresses = new Set(addresses);

        return (
          <div className="space-y-1">
            <div className="text-xs text-gray-600 line-clamp-3">{firstAddress}</div>
            {uniqueAddresses.size > 1 && (
              <div className="text-xs text-amber-600">Có {uniqueAddresses.size} địa chỉ khác nhau</div>
            )}
          </div>
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
            {
              status === OrderStatusType.SHIPPING_REQUEST_CLIENT && <Button
                size="small"
                className="!bg-blue-500 hover:!bg-blue-600 !text-white !border-0 !text-[11px] !px-2 !h-7 !font-medium !rounded w-full"
                onClick={() => {
                  setIsOpenTrackingOrder(true);
                  setOrderDetail(record);
                }}
              >
                {t('button.shipped')}
              </Button>
            }
          </div>
        );
      },
    },
  ];
  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow p-6">
        {/* Header with Filter */}
        <div className="flex flex-col mb-2 gap-4">
          {/* <h2 className="text-lg font-semibold">
            {t('page.importedProductList')}
          </h2> */}
          <ShipmentFilter
           onFilter={handleFinish}
           initialFilters={filters}
          />

        </div>

        <EnhancedTableWrapper className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={listOrder || []}
            rowKey="tracking_ship"
            pagination={{
              current: (listOrder && listOrder.current_page + 1) || 1,
              pageSize: 20,
              onChange: handleChangePage,
              showSizeChanger: false,
            }}
            expandable={{
              expandedRowRender: (record: Order) => (
                <ExpandedOrderDetails orderList={record.order_list || []} />
              ),
              rowExpandable: (record) => (record.order_list || []).length > 0,
              expandIcon: ({ expanded, onExpand, record }) => (
                <Button
                  type="text"
                  size="small"
                  icon={<DownOutlined className={`text-xs transition-transform ${expanded ? 'rotate-180' : ''}`} />}
                  onClick={(e) => onExpand(record, e)}
                  className="!p-1"
                />
              ),
            }}
            scroll={{ x: 'max-content' }}
            size="small"
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
                  shipping_code: orderDetail.tracking_ship,
                  // shipping_fee: +value.shipping_fee,
                  shipping_type: value.shipping_type,
                  shipping_fee: value.shipping_fee,
                  shipping_tracking: value.shipping_code
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

    </div>
  );
};

// Component hiển thị chi tiết từng order trong vận đơn
function ExpandedOrderDetails({ orderList }: { orderList: OrderItem[] }) {
  const { t } = useTranslation();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case OrderStatusType.PENDING_APPROVAL:
        return "orange";
      case OrderStatusType.PENDING_DEPOSIT:
        return "gold";
      case OrderStatusType.DEPOSIT_PAID:
        return "green";
      case OrderStatusType.PURCHASED:
        return "blue";
      case OrderStatusType.ARRIVED_JP_WAREHOUSE:
        return "purple";
      case OrderStatusType.ARRIVED_VN_WAREHOUSE:
        return "cyan";
      case OrderStatusType.UNDER_INSPECTION:
        return "lime";
      case OrderStatusType.READY_TO_SHIP:
        return "geekblue";
      case OrderStatusType.SHIPPED:
        return "volcano";
      case OrderStatusType.SHIPPING_REQUEST_CLIENT:
        return "magenta";
      default:
        return "default";
    }
  };

  const orderDetailColumns: ColumnsType<OrderItem> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_: any, __: any, index: number) => (
        <div className="text-xs font-medium">{index + 1}</div>
      ),
    },
    {
      title: "Mã đơn",
      key: "invoice_no",
      width: 120,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="text-xs font-medium text-blue-600">{record.invoice_no || "-"}</div>
      ),
    },
    {
      title: "Mã VN / JP",
      key: "tracking",
      width: 150,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-500">VN: </span>
            <span className="text-gray-800">{record.tracking_vn || "-"}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">JP: </span>
            <span className="text-gray-800">{record.tracking_other || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 250,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => {
        let productName = "-";
        let productImage = null;
        let quantity = 0;

        if (record.metadata) {
          try {
            const metadata = typeof record.metadata === 'string'
              ? JSON.parse(record.metadata)
              : record.metadata;

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
            <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
              {productImage ? (
                <img src={productImage} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] text-gray-400">No img</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-800 line-clamp-2">{productName}</div>
              <div className="text-xs text-gray-500">SL: {quantity}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "CN",
      key: "weight",
      width: 80,
      align: "center",
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="text-xs text-gray-800">{record.weight ? `${record.weight}kg` : "-"}</div>
      ),
    },
    {
      title: "Số tiền",
      key: "amount",
      width: 120,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-500">JPY: </span>
            <span className="text-gray-800 font-medium">
              {record.amount ? `${record.amount.toLocaleString("en-US")}¥` : "-"}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">VND: </span>
            <span className="text-blue-600 font-medium">
              {record.amount_vnd ? `${record.amount_vnd.toLocaleString("en-US")}đ` : "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Cọc",
      key: "deposit",
      width: 100,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="text-xs text-green-600 font-medium">
          {record.deposit_fee ? `${record.deposit_fee.toLocaleString("en-US")}đ` : "-"}
        </div>
      ),
    },
    {
      title: "Ghi chú",
      key: "description",
      width: 150,
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) => (
        <div className="text-xs text-gray-600 line-clamp-2">{record.description || "-"}</div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center",
      onCell: () => ({
        style: {
          borderRight: "1px solid #f0f0f0",
        },
      }),
      render: (_, record) =>{
        let text: string ='';
        const status = record.status;

        switch (status) {
          case OrderStatusType.PENDING_APPROVAL:
            text = t('status.pendingApproval');
            break;
          case OrderStatusType.PENDING_DEPOSIT:
            text = t('status.pendingDeposit');
            break;
          case OrderStatusType.DEPOSIT_PAID:
            text = t('status.depositPaid');
            break;
          case OrderStatusType.PURCHASED:
            text = t('status.purchased');
            break;
          case OrderStatusType.ARRIVED_JP_WAREHOUSE:
            text = t('status.arrivedJpWarehouse');
            break;
          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            text = t('status.arrivedVnWarehouse');
            break;
          case OrderStatusType.UNDER_INSPECTION:
            text = t('status.underInspection');
            break;
          case OrderStatusType.PENDING_PAYMENT:
            text = t('status.pendingPayment');
            break;
          case OrderStatusType.READY_TO_SHIP:
            text = t('status.readyToShip');
            break;
          case OrderStatusType.SHIPPED:
            text = t('status.shipped');
            break;
          case OrderStatusType.SHIPPING_REQUEST_CLIENT:
            text = t('status.shippingRequest');
            break;
          case OrderStatusType.CANCELED:
            text = t('status.cancelled');
            break;
          default:
        }
        return (
          <Tag color={getStatusColor(record.status)} className="!text-[10px] !py-0.5 !px-2">
            {text || "-"}
          </Tag>
        )
      } ,
    },
  ];

  return (
    <div className="bg-gray-50 p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Chi tiết đơn hàng ({orderList.length} đơn)
        </h4>
      </div>
      <Table
        columns={orderDetailColumns}
        dataSource={orderList}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        className="order-detail-table"
      />
    </div>
  );
}

export default ProductManagement;
