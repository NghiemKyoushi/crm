"use client";

import React, { useState } from "react";
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

const ProductManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [orderDetail, setOrderDetail] = useState<Order>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();


  const { data: listOrder } = useListOrderTracking({
    page,
    size: 20,
    status: [
      OrderStatusType.ARRIVED_VN_WAREHOUSE,
      OrderStatusType.READY_TO_SHIP,
      OrderStatusType.SHIPPING_REQUEST_CLIENT,
      OrderStatusType.SHIPPED
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
    // {
    //   title: "Ngày Về",
    //   key: "arrival_date",
    //   width: 80,
    //   render: (_, record) => (
    //     <div className="text-xs text-gray-800">-</div>
    //   ),
    // },
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
    // {
    //   title: "Sản Phẩm",
    //   key: "product",
    //   width: 280,
    //   render: (_, record) => {
    //     const orderList = record.order_list || [];

    //     // Lấy tất cả sản phẩm từ tất cả orders
    //     const allProducts: Array<{ name: string; quantity: number; image: string | null }> = [];

    //     orderList.forEach((order) => {
    //       if (order.metadata) {
    //         try {
    //           const metadata = typeof order.metadata === 'string'
    //             ? JSON.parse(order.metadata)
    //             : order.metadata;

    //           const items = metadata?.items || [];
    //           items.forEach((item: any) => {
    //             const product = item.product;
    //             const productName = product?.map_data?.productName || "Sản phẩm";
    //             const quantity = item.count || 0;
    //             const images = product?.map_data?.images || [];
    //             const productImage = images.length > 0 ? images[0] : null;

    //             allProducts.push({ name: productName, quantity, image: productImage });
    //           });
    //         } catch (e) {
    //           console.error("Error parsing metadata:", e);
    //         }
    //       }
    //     });

    //     // Tính tổng số lượng sản phẩm
    //     const totalProductQty = allProducts.reduce((sum, p) => sum + p.quantity, 0);

    //     const firstProduct = allProducts[0];
    //     const remainingProducts = allProducts.length - 1;

    //     return (
    //       <div className="flex gap-2">
    //         {firstProduct && (
    //           <>
    //             <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
    //               {firstProduct.image ? (
    //                 <img src={firstProduct.image} alt="Product" className="w-full h-full object-cover" />
    //               ) : (
    //                 <div className="w-full h-full flex items-center justify-center">
    //                   <span className="text-xs text-gray-400">No img</span>
    //                 </div>
    //               )}
    //             </div>
    //             <div className="flex-1 min-w-0 space-y-1">
    //               <div className="text-xs text-gray-800 line-clamp-2">
    //                 {firstProduct.name}
    //               </div>
    //               <div className="text-xs">
    //                 <span className="text-gray-500">Tổng SL: </span>
    //                 <span className="text-gray-800 font-medium">{totalProductQty}</span>
    //               </div>
    //               {remainingProducts > 0 && (
    //                 <div className="text-xs text-blue-600">
    //                   +{remainingProducts} SP khác
    //                 </div>
    //               )}
    //             </div>
    //           </>
    //         )}
    //         {!firstProduct && (
    //           <div className="text-xs text-gray-400">Không có sản phẩm</div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Phụ Phí",
    //   key: "extra_fee",
    //   width: 110,
    //   onCell: () => ({
    //     style: {
    //       borderRight: '1px solid #f0f0f0',
    //     },
    //   }),
    //   render: (_, record) => (
    //     <div className="text-xs text-gray-800 text-left">-</div>
    //   ),
    // },
    // {
    //   title: "Ghi Chú",
    //   key: "note",
    //   width: 140,
    //   onCell: () => ({
    //     style: {
    //       borderRight: '1px solid #f0f0f0',
    //     },
    //   }),
    //   render: (_, record) => {
    //     const orderList = record.order_list || [];
    //     const descriptions = orderList
    //       .map(order => order.description)
    //       .filter(Boolean);

    //     const firstDescription = descriptions[0] || "-";

    //     return (
    //       <div className="space-y-1">
    //         <div className="text-xs text-gray-600 line-clamp-2">{firstDescription}</div>
    //         {descriptions.length > 1 && (
    //           <div className="text-xs text-blue-600">+{descriptions.length - 1} ghi chú khác</div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Phí & Tỷ Giá",
    //   key: "fees_rates",
    //   width: 160,
    //   onCell: () => ({
    //     style: {
    //       borderRight: '1px solid #f0f0f0',
    //     },
    //   }),
    //   render: (_, record) => {
    //     const orderList = record.order_list || [];

    //     // Tính tổng shipping fee và weight fee
    //     const totalShippingFee = orderList.reduce((sum, order) => sum + (order.shipping_fee || 0), 0);
    //     const totalWeightFee = orderList.reduce((sum, order) => sum + (order.weight_fee || 0), 0);

    //     // Lấy rate (giả sử rate giống nhau cho tất cả orders)
    //     const rate = orderList[0]?.rate;

    //     return (
    //       <div className="space-y-1">
    //         <div className="text-xs">
    //           <span className="text-gray-500">Ship: </span>
    //           <span className="text-gray-800 font-medium">
    //             {totalShippingFee > 0 ? `${totalShippingFee.toLocaleString("vi-VN")}¥` : "-"}
    //           </span>
    //         </div>
    //         <div className="text-xs">
    //           <span className="text-gray-500">CN: </span>
    //           <span className="text-gray-800 font-medium">
    //             {totalWeightFee > 0 ? `${totalWeightFee.toLocaleString("vi-VN")}đ` : "-"}
    //           </span>
    //         </div>
    //         <div className="text-xs">
    //           <span className="text-gray-500">TG: </span>
    //           <span className="text-gray-800">{rate || "-"}</span>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "COD (Việt)",
    //   key: "transfer_fee",
    //   width: 180,
    //   onCell: () => ({
    //     style: {
    //       borderRight: '1px solid #f0f0f0',
    //     },
    //   }),
    //   render: (_, record) => {
    //     const orderData = record.order_list?.[0];
    //     const codPrice = orderData?.cod_shipping_price || 0;
    //     const shippingPrice = codPrice || orderData?.shipping_fee || 0;
    //     const shippingCode = orderData?.tracking_vn || "";
    //     const isShippingRequest = record.status === OrderStatusType.SHIPPING_REQUEST_CLIENT;

    //     let shippingTypeText = "-";
    //     let shippingTypeColor = "text-gray-600";

    //     if (codPrice > 0) {
    //       shippingTypeText = "COD";
    //       shippingTypeColor = "text-blue-600";
    //     }

    //     const showWarningCode = isShippingRequest && !shippingCode;
    //     const showWarningPrice = isShippingRequest && !shippingPrice;
    //     const showWarningType = isShippingRequest && shippingTypeText === "-";

    //     return (
    //       <div className="space-y-1">
    //         <div className="text-xs flex items-center justify-between gap-2">
    //           <div className="flex items-center gap-1">
    //             <span className="text-gray-500">Mã: </span>
    //             {showWarningCode ? (
    //               <Tooltip title="Chưa có mã vận chuyển">
    //                 <ExclamationCircleOutlined className="text-amber-500 text-sm cursor-help" style={{ color: '#f59e0b' }} />
    //               </Tooltip>
    //             ) : (
    //               <span className="text-gray-800">{shippingCode || "-"}</span>
    //             )}
    //           </div>
    //           {isShippingRequest && (
    //             <EditOutlined
    //               className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs flex-shrink-0"
    //               onClick={() => {
    //                 setOrderDetail(record);
    //                 setIsOpenTrackingOrder(true);
    //               }}
    //             />
    //           )}
    //         </div>
    //         <div className="text-xs flex items-center gap-1">
    //           <span className="text-gray-500">Giá: </span>
    //           {showWarningPrice ? (
    //             <Tooltip title="Chưa có giá vận chuyển">
    //               <ExclamationCircleOutlined className="text-amber-500 text-sm cursor-help" style={{ color: '#f59e0b' }} />
    //             </Tooltip>
    //           ) : (
    //             <span className="text-gray-800 font-medium">
    //               {shippingPrice > 0 ? `${shippingPrice.toLocaleString("vi-VN")}đ` : "-"}
    //             </span>
    //           )}
    //         </div>
    //         <div className="text-xs flex items-center gap-1">
    //           <span className="text-gray-500">HT: </span>
    //           {showWarningType ? (
    //             <Tooltip title="Chưa có hình thức">
    //               <ExclamationCircleOutlined className="text-amber-500 text-sm cursor-help" style={{ color: '#f59e0b' }} />
    //             </Tooltip>
    //           ) : (
    //             <span className={`font-medium ${shippingTypeColor}`}>
    //               {shippingTypeText}
    //             </span>
    //           )}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Thanh Toán & Công Nợ",
    //   key: "payment_info",
    //   width: 170,
    //   onCell: () => ({
    //     style: {
    //       borderRight: '1px solid #f0f0f0',
    //     },
    //   }),
    //   render: (_, record) => {
    //     const orderList = record.order_list || [];

    //     // Tính tổng deposit fee và amount_vnd từ tất cả orders
    //     const totalDepositFee = orderList.reduce((sum, order) => sum + (order.deposit_fee || 0), 0);
    //     const totalAmountVnd = orderList.reduce((sum, order) => sum + (order.amount_vnd || 0), 0);
    //     const remaining = totalAmountVnd - totalDepositFee;

    //     return (
    //       <div className="space-y-1">
    //         <div className="text-xs">
    //           <span className="text-gray-500">Cọc: </span>
    //           <span className="text-green-600 font-medium">
    //             {totalDepositFee > 0 ? `${totalDepositFee.toLocaleString("vi-VN")}đ` : "-"}
    //           </span>
    //         </div>
    //         <div className="text-xs">
    //           <span className="text-gray-500">Còn lại: </span>
    //           <span className="text-orange-600 font-medium">
    //             {remaining > 0 ? `${remaining.toLocaleString("vi-VN")}đ` : "-"}
    //           </span>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Tổng Chi Phí",
    //   key: "total_cost",
    //   width: 130,
    //   onCell: () => ({
    //     style: {
    //       borderRight: '1px solid #f0f0f0',
    //     },
    //   }),
    //   render: (_, record) => {
    //     const orderList = record.order_list || [];

    //     // Tính tổng chi phí (weight fee + shipping fee) từ tất cả orders
    //     const totalCost = orderList.reduce(
    //       (sum, order) => sum + (order.weight_fee || 0) + (order.shipping_fee || 0),
    //       0
    //     );

    //     return (
    //       <div className="text-xs text-gray-800 text-left font-medium">
    //         {totalCost > 0 ? `${totalCost.toLocaleString("vi-VN")}đ` : "-"}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Tổng Chi Phí",
    //   key: "total",
    //   width: 110,
    //   onCell: () => ({
    //     style: {
    //       borderRight: '1px solid #f0f0f0',
    //     },
    //   }),
    //   render: (_, record) => {
    //     // Sử dụng amountvnd từ response (đã tính tổng từ backend)
    //     const amountVnd = record.amountvnd || 0;
    //     return (
    //       <div className="text-xs font-medium text-blue-600">
    //         {amountVnd > 0 ? `${amountVnd.toLocaleString("en-US")}đ` : "-"}
    //       </div>
    //     );
    //   },
    // },
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
      label: t('status.shippingRequest'),
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
                  className="!w-full !h-11 !text-xs"
                  size="small"
                />
              </Form.Item>

              <Form.Item name="status" className="mb-0">
                <Select
                  placeholder="Chọn trạng thái"
                  className="!w-full !h-11"
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
                <DatePicker className="!w-full !h-11" size="small" placeholder="Chọn ngày" />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<FontAwesomeIcon icon={faFilter} className="text-xs" />}
                  className="!w-full !h-11 !bg-gray-700 !text-white !font-medium !text-xs"
                  size="small"
                >
                  Lọc
                </Button>
              </Form.Item>
            </div>
          </Form>
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
