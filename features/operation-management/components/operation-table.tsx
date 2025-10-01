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
    size: 20,
    status: [
      OrderStatusType.ARRIVED_VN_WAREHOUSE,
      OrderStatusType.READY_TO_SHIP,
      OrderStatusType.SHIPPING_REQUEST_CLIENT,
    ],
  });

  console.log("listOrder", listOrder);

  const [isOpenTrackingOrder, setIsOpenTrackingOrder] = useState(false);

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const useCompleteShippingMutation = useCompleteShippingOrder();

  const columns: ColumnsType<Order> = [
    {
      title: "Tracking ship",
      key: "tracking_ship",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.tracking_ship}</div>
          {/* <div className="text-xs text-gray-400">{record.}</div> */}
        </div>
      ),
    },
    {
      title: t('table.customer'),
      key: "customer_name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer_name}</div>
          {/* <div className="text-xs text-gray-400">{record.}</div> */}
        </div>
      ),
    },

    {
      title: t('table.creator'),
      key: "user_name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user_name}</div>
        </div>
      ),
    },
    {
      title: t('table.amount'),
      key: "amountvnd",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.amountvnd}</div>
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
            {t('button.shipped')}
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
        {t('page.importedProductList')}
      </h2>
      <TableComponent
        columns={columns}
        dataSource={listOrder || []}
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
    </div>
  );
};

export default ProductManagement;
