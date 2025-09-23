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
import { useListOrder } from "../hooks/orderhub";
import { Invoice, OrderStatus } from "@/types/orderhub";
import TableComponent from "@/components/TableComponent";
import dayjs from "dayjs";
import ApproveOrderModal from "./modal/approve-order-modal";
import CheckOrderModal from "./modal/check-order-modal";
import TrackingModal from "./modal/tracking-modal";

const { Option } = Select;

export default function OrderHub() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  //check  function button
  const [isOpenApproveOrder, setIsOpenApproveOrder] = useState(false);
  const [isOpenCheckOrder, setIsOpenCheckOrder] = useState(false);
  const [isOpenTrackingOrder, setIsOpenTrackingOrder] = useState(false);

  const { data: listOrder } = useListOrder({
    page,
    size: 10,
  });

  const handleFinish = (values: any) => {
    console.log("Filter values:", values);
  };

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
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div>
          <div>{record.product_name}</div>
          <div className="text-xs text-gray-400">
            {record.source} • {record.purchase_type}
          </div>
        </div>
      ),
    },
    {
      title: "Tracking",
      key: "tracking",
      render: (_, record) => (
        <div>
          {record.tracking_code ? (
            <>
              <a href="#" className="text-blue-500 font-medium hover:underline">
                {record.tracking_code}
              </a>
              {record.weight && (
                <div className="text-xs text-gray-400">
                  Cân nặng: {record.weight}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">Chưa có</span>
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
      render: (status: OrderStatus) => {
        let color = "";
        let text = "";

        switch (status) {
          case "WAITING_APPROVAL":
            color = "orange";
            text = "Đợi duyệt";
            break;
          case "WAITING_DEPOSIT":
            color = "gold";
            text = "Đợi đặt cọc";
            break;
          case "PURCHASED":
            color = "blue";
            text = "Đã mua";
            break;
          case "ARRIVED_JP":
            color = "purple";
            text = "Đến kho Nhật";
            break;
          case "ARRIVED_VN":
            color = "cyan";
            text = "Đến kho Việt";
            break;
          case "CHECKING":
            color = "green";
            text = "Đang kiểm hàng";
            break;
          case "WAITING_PAYMENT":
            color = "red";
            text = "Đợi thanh toán";
            break;
          case "READY_TO_SHIP":
            color = "geekblue";
            text = "Sẵn chuyển";
            break;
          default:
            color = "default";
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },

    {
      title: "Hành động",
      key: "actions",
      render: (_, record: Invoice) => {
        const actions: React.ReactNode[] = [];

        // switch (record.status) {
        //   case "WAITING_APPROVAL":
        actions.push(
          <Button
            size="small"
            icon={<FontAwesomeIcon icon={faCheck} />}
            className="!bg-green-500 !text-white !border-0 !text-xs"
            onClick={() => {
              setIsOpenApproveOrder(true);
            }}
          >
            Duyệt
          </Button>
        );
        //   break;

        // case "WAITING_DEPOSIT":
        // chỉ có chi tiết + sửa
        // break;

        // case "PURCHASED":
        actions.push(
          <Button
            size="small"
            icon={<FontAwesomeIcon icon={faPlus} />}
            className="!bg-purple-500 !text-white !border-0 !text-xs"
            onClick={() => {
              setIsOpenTrackingOrder(true);
            }}
          >
            Tracking
          </Button>
        );
        //   break;

        // case "ARRIVED_JP":
        actions.push(
          <Button
            size="small"
            icon={<FontAwesomeIcon icon={faTruck} />}
            className="!bg-indigo-500 !text-white !border-0 !text-xs"
          >
            Chuyển VN
          </Button>
        );
        //   break;

        // case "ARRIVED_VN":
        actions.push(
          <Button
            size="small"
            icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
            className="!bg-teal-500 !text-white !border-0 !text-xs"
            onClick={() => setIsOpenCheckOrder(true)}
          >
            Kiểm hàng
          </Button>
        );
        //   break;

        // case "CHECKING":
        actions.push(
          <Button
            size="small"
            icon={<FontAwesomeIcon icon={faCheck} />}
            className="!bg-green-500 !text-white !border-0 !text-xs"
          >
            Xong
          </Button>
        );
        //   break;

        // case "READY_TO_SHIP":
        actions.push(
          <Button
            size="small"
            icon={<FontAwesomeIcon icon={faTruck} />}
            className="!bg-emerald-500 !text-white !border-0 !text-xs"
          >
            Giao
          </Button>
        );
        // break;
        // }

        // nút mặc định luôn có
        actions.push(
          <Button
            size="small"
            className="!bg-blue-500 !text-white !border-0 !text-xs"
            onClick={()=> setOpenDetail(true)}
          >
            Chi tiết
          </Button>
        );
        actions.push(
          <Button
            size="small"
            className="!bg-yellow-500 !text-white !border-0 !text-xs"
          >
            Sửa
          </Button>
        );

        return <div className="flex gap-2 flex-wrap">{actions}</div>;
      },
    },
  ];
  return (
    <div className="p-6 bg-gray-50 ">
      <div className="bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Quản lý Đơn hàng
          </h2>
          <Button
            type="primary"
            onClick={() => setOpen(true)}
            icon={<PlusOutlined />}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Tạo Đơn hàng mới
          </Button>
        </div>
        <div className="flex flex-col mb-2 gap-4 ">
          <Form form={form} onFinish={handleFinish}>
            <div className="w-full grid grid-cols-4 gap-3 items-center bg-white rounded-lg">
              <Form.Item name="keyword" className="mb-0">
                <Input
                  placeholder="Mã đơn, Mã kiện, Tên KH..."
                  className="w-full h-11"
                />
              </Form.Item>

              <Form.Item name="status" className="mb-0">
                <Select
                  placeholder={t("statusPlaceholder")}
                  className="w-full !h-11"
                >
                  <Option value="COMPLETED">Đang giao hàng</Option>
                  <Option value="CANCELED">Đã về kho</Option>
                  <Option value="FAILED">Đã giao hàng</Option>
                </Select>
              </Form.Item>

              <Form.Item name="dateRange" className="mb-0">
                <Select placeholder="Nguồn" className="w-full !h-11">
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
      <OrderDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
      />
      <ApproveOrderModal
        open={isOpenApproveOrder}
        customerName="Nguyễn Văn A (SC244)"
        orderCode="#DH-0810-1"
        onCancel={() => setIsOpenApproveOrder(false)}
        onSubmit={() => console.log("check")}
      />
      <CheckOrderModal
        open={isOpenCheckOrder}
        customerName="Nguyễn Văn A (SC244)"
        feePerKg={10}
        onCancel={() => setIsOpenCheckOrder(false)}
        onSubmit={() => console.log("check")}
        orderCode="#DH-0810-1"
      />
      <TrackingModal
        customerName="Nguyễn Văn A (SC244)"
        orderCode="#DH-0810-1"
        onCancel={() => setIsOpenTrackingOrder(false)}
        onSubmit={() => console.log("check")}
        open={isOpenTrackingOrder}
      />
    </div>
  );
}
