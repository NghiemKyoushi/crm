import React, { useState } from "react";
import { Table, Tag, Button, Input, Select, Form, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import CreateOrderModal from "./modal/add-orderhub-modal";
import OrderDetailModal from "./modal/orderhub-detail-modal";
import { useTranslation } from "react-i18next";

const { Option } = Select;

interface Order {
  key: string;
  maDon: string;
  khachHang: string;
  ngayTao: string;
  trangThai: string;
  hanhDong: string;
}

const data: Order[] = [
  {
    key: "1",
    maDon: "#DH-0810-1",
    khachHang: "Nguyễn Văn A (SC244)",
    ngayTao: "10/08/2025",
    trangThai: "Chờ xác nhận",
    hanhDong: "Xem chi tiết",
  },
  {
    key: "2",
    maDon: "#DH-0809-1",
    khachHang: "Trần Thị B (SC231)",
    ngayTao: "09/08/2025",
    trangThai: "Chờ xác nhận",
    hanhDong: "Xem chi tiết",
  },
  {
    key: "3",
    maDon: "#DH-0808-1",
    khachHang: "Lê Văn C (SC144)",
    ngayTao: "08/08/2025",
    trangThai: "Chờ xác nhận",
    hanhDong: "Xem chi tiết",
  },
  {
    key: "4",
    maDon: "#DH-0806-1",
    khachHang: "Nguyễn Văn A (SC244)",
    ngayTao: "06/08/2025",
    trangThai: "Đã đặt cọc",
    hanhDong: "Xem chi tiết",
  },
  {
    key: "5",
    maDon: "#DH-0805-1",
    khachHang: "Trần Thị B (SC231)",
    ngayTao: "05/08/2025",
    trangThai: "Đang vận chuyển về Việt Nam",
    hanhDong: "Xem chi tiết",
  },
];

export default function OrderHub() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const { t } = useTranslation();

  const handleFinish = (values: any) => {
    console.log("Filter values:", values);
  };

  const columns: ColumnsType<Order> = [
    {
      title: "Mã Đơn",
      dataIndex: "maDon",
      key: "maDon",
      render: (text) => <a className="text-blue-600 font-medium">{text}</a>,
    },
    {
      title: "Khách hàng",
      dataIndex: "khachHang",
      key: "khachHang",
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngayTao",
      key: "ngayTao",
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (status) => {
        let color = "default";
        if (status === "Chờ xác nhận") color = "orange";
        if (status === "Đã đặt cọc") color = "gold";
        if (status === "Đang vận chuyển về Việt Nam") color = "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      dataIndex: "hanhDong",
      key: "hanhDong",
      render: (text) => (
        <button className="!text-blue-600" onClick={() => setOpenDetail(true)}>
          {text}
        </button>
      ),
    },
  ];
  return (
    <div className="p-6 bg-gray-50 ">
      <div className="bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Quản lý Đơn hàng (Order Hub)
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

        {/* Table */}
        <Table dataSource={data} columns={columns} pagination={false} />
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
    </div>
  );
}
