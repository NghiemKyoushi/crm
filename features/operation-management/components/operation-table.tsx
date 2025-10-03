"use client";

import React, { useState } from "react";
import { Form, Input, Button, Tag, DatePicker, Select, Modal } from "antd";
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
import { EditOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";

const ProductManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [orderDetail, setOrderDetail] = useState<Order>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [isEditingTracking, setIsEditingTracking] = useState<{
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
      title: "STT",
      key: "stt",
      width: 50,
      align: "center",
      fixed: "left",
      render: (_, __, index) => (
        <div className="text-xs font-medium">{(page * 20) + index + 1}</div>
      ),
    },
    {
      title: "Ngày TT",
      key: "payment_created_date",
      width: 80,
      render: (_, record) => (
        <div className="text-xs text-gray-800">
          {record.created_at ? dayjs(record.created_at).format("DD/MM/YY") : "-"}
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
        // Giả sử có tracking data từ API
        const trackingRecords = [
          {
            tracking: record.tracking_ship || "",
            packageCode: "",
            quantity: 0,
            weight: ""
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
                      <span className="text-gray-800">{firstRecord.quantity || "-"}</span>
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
                onClick={() => setIsEditingTracking({
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
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-xs text-gray-800 font-medium">{record.customer_name}</div>
          <div className="text-xs text-gray-500">{record.customer_code || "-"}</div>
          <div className="text-xs text-blue-600">
            <span className="text-gray-500">NTạo: </span>
            {record.user_name}
          </div>
        </div>
      ),
    },
    {
      title: "Sản Phẩm",
      key: "product",
      width: 280,
      render: (_, record) => {
        const orderList = record.order_list || [];
        const firstItem = orderList.length > 0 ? orderList[0] : null;

        return (
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-gray-400">No img</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs text-gray-800 line-clamp-2">
                {firstItem?.product_name || "Không có sản phẩm"}
              </div>
              <div className="text-xs">
                <span className="text-gray-500">SL: </span>
                <span className="text-gray-800">{firstItem?.quantity || 0}</span>
                {orderList.length > 1 && (
                  <span className="text-gray-500 ml-2">+{orderList.length - 1} sản phẩm</span>
                )}
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
        <div className="text-xs text-gray-800 text-right">-</div>
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
        <div className="text-xs text-gray-600">-</div>
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
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-500">Ship: </span>
            <span className="text-gray-800">-</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">DV: </span>
            <span className="text-gray-800">-</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">TG Yên: </span>
            <span className="text-gray-800">-</span>
          </div>
        </div>
      ),
    },
    {
      title: "Tiền V.Chuyển",
      key: "transfer_fee",
      width: 180,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_) => {
        // TODO: Get shipping data from API
        const shippingCode = "-";
        const shippingPrice = 0;
        const shippingType = "" as "customer_pay" | "cod" | "free" | "";

        let shippingTypeText = "";
        let shippingTypeColor = "text-gray-600";

        if (shippingType === "customer_pay") {
          shippingTypeText = "KH tự trả";
          shippingTypeColor = "text-orange-600";
        } else if (shippingType === "cod") {
          shippingTypeText = "COD";
          shippingTypeColor = "text-blue-600";
        } else if (shippingType === "free") {
          shippingTypeText = "Miễn phí";
          shippingTypeColor = "text-green-600";
        } else {
          shippingTypeText = "-";
        }

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
              <span className="text-gray-500">Hình thức: </span>
              <span className={`font-medium ${shippingTypeColor}`}>
                {shippingTypeText}
              </span>
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
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-500">Cọc: </span>
            <span className="text-green-600 font-medium">-</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Sau cọc: </span>
            <span className="text-orange-600 font-medium">-</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Đã TT: </span>
            <span className="text-gray-800">-</span>
          </div>
        </div>
      ),
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
      render: (_, record) => (
        <div className="text-xs text-gray-800 text-right">-</div>
      ),
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
          {record.amountvnd ? record.amountvnd.toLocaleString("vi-VN") : "0"}đ
        </div>
      ),
    },
    {
      title: "Ghi Chú",
      key: "note_extra",
      width: 140,
      onCell: () => ({
        style: {
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => (
        <div className="text-xs text-gray-600">-</div>
      ),
    },
    {
      title: "Trạng Thái & Hành Động",
      key: "status_actions",
      width: 140,
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
          <div className="flex flex-col items-center justify-center gap-1 py-1">
            <Tag
              color={color}
              className="!text-[10px] m-0 !py-0 !px-1 !leading-4"
              style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '90px', height: '18px' }}
            >
              {text}
            </Tag>
            <Button
              size="small"
              className="!bg-blue-500 !text-white !border-0 !text-[10px] !px-1 !h-6 w-full"
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
                  cod_fee: value.code_fee,
                  shipping_option: value.shipping_option,
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
              queryKey: ["listorderTracking"],
            });
          }}
        />
      )}
    </div>
  );
};

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

export default ProductManagement;
