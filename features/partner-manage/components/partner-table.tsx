"use client";

import React, { useState } from "react";
import {
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  Typography,
  Popconfirm,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faWallet,
  faYenSign,
} from "@fortawesome/free-solid-svg-icons";
import TableComponent from "@/components/TableComponent";

const { Option } = Select;
const { Title, Text } = Typography;

interface PartnerRecord {
  key: string;
  name: string;
  description: string;
  total: number;
  rate: number;
  createdAt: string;
}

const dataSource: PartnerRecord[] = [
  {
    key: "1",
    name: "Nhà cung cấp Tokyo ABC",
    description: "Nguyên liệu đạt chất lượng cao",
    total: 220000,
    rate: 175,
    createdAt: "15/01/2024",
  },
  {
    key: "2",
    name: "Osaka Materials Ltd",
    description: "Nhà cung cấp vật liệu xây dựng",
    total: 180000,
    rate: 178,
    createdAt: "10/01/2024",
  },
  {
    key: "3",
    name: "Kyoto Steel Co.",
    description: "Thép và kim loại cao cấp",
    total: 320000,
    rate: 172,
    createdAt: "08/01/2024",
  },
  {
    key: "4",
    name: "Đơn #AG-88673",
    description: "Thép và kim loại cao cấp",
    total: -320000,
    rate: 180,
    createdAt: "08/01/2024",
  },
];

export default function JPYManagementPage() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("jpy");
  const [page, setPage] = useState(0);

  const columns = [
    {
      title: "Từ",
      dataIndex: "name",
      render: (_: string, record: PartnerRecord) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary">{record.description}</Text>
        </div>
      ),
    },
    {
      title: activeTab === "jpy" ? "Tổng Mua (JPY)" : "Tổng Mua (USD)",
      dataIndex: "total",
      render: (value: number) => (
        <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
          {value >= 0 ? "+" : ""}
          {value.toLocaleString("ja-JP")} {activeTab === "jpy" ? "¥" : "$"}
        </span>
      ),
    },
    {
      title: "Tỷ giá",
      dataIndex: "rate",
      render: (value: number) => `${value} đ`,
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
    },
    {
      title: "Hành động",
      render: () => (
        <Popconfirm title="Xóa bản ghi này?">
          <DeleteOutlined className="text-red-500 cursor-pointer" />
        </Popconfirm>
      ),
    },
  ];
  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tabs thay cho Breadcrumb */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "jpy", label: "Quản lý (JPY)" },
          { key: "usd", label: "Quản lý (USD)" },
        ]}
      />

      {/* Tổng quan */}
      <div>
        <Title level={4}>
          {activeTab === "jpy"
            ? "Tổng quan Quản lý JPY"
            : "Tổng quan Quản lý USD"}
        </Title>
        <div className="p-3 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="!h-32 !p-0 !bg-gradient-to-r !from-blue-500 !to-blue-600 !text-white shadow-md rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Tổng Đối tác</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <FontAwesomeIcon icon={faUsers} className="text-3xl opacity-90 w-4 h-4" />
            </div>
          </Card>

          <Card className="!h-32  !p-0 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white shadow-md rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">
                  Tổng Mua ({activeTab === "jpy" ? "JPY" : "USD"})
                </p>
                <p className="text-2xl font-bold">
                  0 {activeTab === "jpy" ? "¥" : "$"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faYenSign}
                className="text-3xl opacity-90 w-4 h-4"
              />
            </div>
          </Card>

          <Card className="!h-32  !p-0 !bg-gradient-to-r !from-purple-500 !to-fuchsia-600 !text-white shadow-md rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">
                  Tổng còn lại ({activeTab === "jpy" ? "JPY" : "USD"})
                </p>
                <p className="text-2xl font-bold">
                  0 {activeTab === "jpy" ? "¥" : "$"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faWallet}
                className="text-3xl opacity-90 w-4 h-4"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Form thêm giao dịch */}
      <div className="p-6 bg-white rounded-lg shadow w-full">
        <Title level={5} className="!mb-4 !text-gray-800">
          Thêm Giao dịch Mua Nguyên liệu
        </Title>

        <Form
          form={form}
          layout="vertical" // ✅ label hiển thị trên input
          className="grid  grid-cols-5 gap-4 !w-full"
        >
          {/* Đối tác */}
          <Form.Item
            name="partner"
            label="Đối tác *"
            rules={[{ required: true, message: "Chọn đối tác" }]}
            className="mb-0"
          >
            <Select
              placeholder="-- Chọn đối tác --"
              className="!w-full !h-10"
            />
          </Form.Item>

          {/* Số tiền */}
          <Form.Item
            name="amount"
            label="Số tiền Yên *"
            rules={[{ required: true, message: "Nhập số tiền" }]}
            className="mb-0"
          >
            <Input type="number" suffix="¥" className="!w-full !h-10" />
          </Form.Item>

          {/* Tỷ giá */}
          <Form.Item
            name="rate"
            label="Tỷ giá *"
            initialValue={180}
            rules={[{ required: true }]}
            className="mb-0"
          >
            <Input type="number" suffix="đ" className="!w-full !h-10" />
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item name="note" label="Ghi chú" className="mb-0">
            <Input placeholder="Ghi chú..." className="!w-full !h-10" />
          </Form.Item>

          {/* Button */}
          <Form.Item
            label=" "
            className="mb-0 col-span-1 md:col-span-1 !w-full"
          >
            <Button
              type="primary"
              className="bg-blue-600 hover:!bg-blue-700 px-6 !h-10 !rounded-lg w-full"
            >
              + Thêm
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Danh sách */}
      <div className="p-6 bg-white rounded-lg shadow">
        <Title level={5}>Danh sách Đối tác và Công nợ</Title>
        <TableComponent
          columns={columns}
          dataSource={dataSource || []}
          rowHeight={45}
          pageSize={10}
          page={dataSource.length || 0}
          onPageChange={handleChangePage}
          response={undefined}
          fontSize={14}
          headerHeight={44}
        />
      </div>
    </div>
  );
}
