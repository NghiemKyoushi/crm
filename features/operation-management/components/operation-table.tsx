"use client";

import React, { useState } from "react";
import { Form, Input, Button, Table, Tag } from "antd";
import TableComponent from "@/components/TableComponent";
import { useListOrder } from "@/features/order-hub/hooks/orderhub";
import { Invoice, OrderStatusType } from "@/types/orderhub";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const ProductManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);

  const { data: listOrder } = useListOrder({
    page,
    size: 10,
    status: OrderStatusType.ARRIVED_VN_WAREHOUSE,
  });
  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };
  const columns: ColumnsType<Invoice> = [
    {
      title: "Mã Đơn",
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
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer_name}</div>
          <div className="text-xs text-gray-400">{record.customer_code}</div>
        </div>
      ),
    },
    {
      title: "Người tạo",
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
      title: "Giá trị",
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
      render: (_, record: Invoice) => {
        const actions: React.ReactNode[] = [];
        actions.push(
          <Button
            key={1}
            size="small"
            className="!bg-blue-500 !text-white !border-0 !text-xs"
            onClick={() => {
              //   setOpenDetail(true);
              //   setOrderDetail(record);
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
      {/* <h2 className="text-lg font-semibold mb-4">Thêm Sản Phẩm Mới</h2> */}
      {/* <Form form={form} layout="vertical" className="grid grid-cols-3 gap-4">
        <Form.Item label="STT" name="stt">
          <Input placeholder="S8Txx" />
        </Form.Item>
        <Form.Item label="Mã KH" name="customerCode">
          <Input placeholder="SCxxx" />
        </Form.Item>
        <Form.Item label="Tên Sản Phẩm" name="name">
          <Input placeholder="VD: khoan, máy cưa..." />
        </Form.Item>
        <Form.Item label="Giá Mua (¥)" name="priceYen">
          <Input />
        </Form.Item>
        <Form.Item label="Đã TT (VND)" name="paidVnd">
          <Input />
        </Form.Item>
        <Form.Item label="Mã Kiện" name="packageCode">
          <Input />
        </Form.Item>
        <Form.Item label="Ghi chú" name="note" className="col-span-3">
          <Input />
        </Form.Item>
        <div className="col-span-3">
          <Button type="primary" className="bg-blue-600">
            + Thêm vào bảng kê
          </Button>
        </div>
      </Form> */}
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
        response={listOrder}
        fontSize={14}
        headerHeight={44}
      />{" "}
    </div>
  );
};

export default ProductManagement;
