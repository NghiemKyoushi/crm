"use client";

import React, { useState } from "react";
import { Form, Input, Button, Table, Tag } from "antd";
import TableComponent from "@/components/TableComponent";
import {
  useCompleteShippingOrder,
  useListOrderTracking,
} from "@/features/order-hub/hooks/orderhub";
import { Invoice, OrderStatusType } from "@/types/orderhub";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import TrackingModalShip from "./modal/modal-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Order } from "@/types/operation-manage";

const ProductManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [orderDetail, setOrderDetail] = useState<Order>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: listOrder } = useListOrderTracking({
    page,
    size: 10,
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

  const useCompleteShippingMutation = useCompleteShippingOrder();

  const columns: ColumnsType<Order> = [
    {
      title: "Khách hàng",
      key: "customer_name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer_name}</div>
          {/* <div className="text-xs text-gray-400">{record.}</div> */}
        </div>
      ),
    },
    {
      title: "Người tạo",
      key: "user_name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user_name}</div>
        </div>
      ),
    },
    {
        title: "Số tiền",
        key: "amountvnd",
        render: (_, record) => (
          <div>
            <div className="font-medium">{record.amountvnd}</div>
          </div>
        ),
      },
    {
      title: "Trạng thái",
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
            text = "Đợi duyệt";
            break;
          case OrderStatusType.PENDING_DEPOSIT:
            color = "gold";
            text = "Đợi đặt cọc";
            break;
          case OrderStatusType.DEPOSIT_PAID:
            color = "green";
            text = "Đã đặt cọc";
            break;
          case OrderStatusType.PURCHASED:
            color = "blue";
            text = "Đã mua";
            break;
          case OrderStatusType.ARRIVED_JP_WAREHOUSE:
            color = "purple";
            text = "Đến kho Nhật";
            break;
          case OrderStatusType.ARRIVED_VN_WAREHOUSE:
            color = "cyan";
            text = "Đến kho Việt";
            break;
          case OrderStatusType.UNDER_INSPECTION:
            color = "lime";
            text = "Đang kiểm hàng";
            break;
          case OrderStatusType.PENDING_PAYMENT:
            color = "red";
            text = "Đợi thanh toán";
            break;
          case OrderStatusType.READY_TO_SHIP:
            color = "geekblue";
            text = "Sẵn sàng giao";
            break;
          case OrderStatusType.SHIPPED:
            color = "volcano";
            text = "Đã chuyển";
            break;
          case OrderStatusType.SHIPPING_REQUEST_CLIENT:
            color = "magenta";
            text = "Yêu cầu chuyển hàng";
            break;
          case OrderStatusType.CANCELED:
            color = "red";
            text = "Đã Huỷ";
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
      title: "Hành động",
      key: "actions",
      align: "right",
      onCell: () => ({
        style: {
          textAlign: "right",
        },
      }),
      render: (_, record: Order) => {
        const actions: React.ReactNode[] = [];
        actions.push(
          <Button
            key={1}
            size="small"
            className="!bg-blue-500 !text-white !border-0 !text-xs"
            onClick={() => {
              setIsOpenTrackingOrder(true);
              setOrderDetail(record);
            }}
          >
            Đã chuyển
          </Button>
        );
        return (
          <div className="flex gap-2 flex-wrap justify-end">{actions}</div>
        );
      },
    },
  ];
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mt-8 mb-4">
        Danh sách sản phẩm đã nhập
      </h2>
      <TableComponent
        columns={columns}
        dataSource={listOrder?.data || []}
        rowHeight={45}
        pageSize={10}
        page={(listOrder && listOrder.current_page + 1) || 0}
        onPageChange={handleChangePage}
        response={undefined}
        fontSize={14}
        headerHeight={44}
      />

      {orderDetail && (
        <TrackingModalShip
          customerName={orderDetail.customer_name}
          orderCode={""}
          onCancel={() => setIsOpenTrackingOrder(false)}
          onSubmit={(value) => {
            useCompleteShippingMutation.mutate(
              {
                body: {
                  shipping_code: value.shipping_code,
                  shipping_fee: value.shipping_fee,
                },
                id: orderDetail.tracking_ship,
              },
              {
                onSuccess: () => {
                  toast.success("Xác nhận vận chuyển thành công!");
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

export default ProductManagement;
