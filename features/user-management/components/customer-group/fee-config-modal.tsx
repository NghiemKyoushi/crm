"use client";

import { useState } from "react";
import { Modal, Button, Table, Tag, Card } from "antd";
import { CloseCircleOutlined, CreditCardOutlined, EditOutlined, SafetyCertificateOutlined, ShoppingCartOutlined } from "@ant-design/icons";

interface FeeHistory {
  time: string;
  user: string;
  action: string;
  type: string;
  label: string;
}

interface ExtraFee {
  country: string;
  product: string;
  condition: string;
  customFee: string;
  defaultFee: string;
  status: string;
}
interface FeeConfigModalProps {
  open: boolean;
  onCancel: () => void;
}
export default function FeeConfigModal(props: FeeConfigModalProps) {
  const { onCancel, open } = props;

  // fake data
  const extraFees: ExtraFee[] = [
    {
      country: "🇯🇵 Japan",
      product: "Điện tử",
      condition: "≥ 50,000 JPY",
      customFee: "3%",
      defaultFee: "5%",
      status: "Đang áp dụng",
    },
    {
      country: "🇺🇸 US",
      product: "Thời trang",
      condition: "50 - 150 USD",
      customFee: "2%",
      defaultFee: "3%",
      status: "Đang áp dụng",
    },
  ];

  const history: FeeHistory[] = [
    {
      time: "08/08/2025 14:30",
      user: "Admin",
      action: "Thay đổi phí mua hộ từ 5% → 3% cho khách VIP",
      type: "mua-ho",
      label: "Mua hộ",
    },
    {
      time: "25/07/2025 09:15",
      user: "Trần Thị Bích",
      action: "Cập nhật phí thanh toán từ 200 JPY → 150 JPY",
      type: "thanh-toan",
      label: "Thanh toán",
    },
    {
      time: "10/07/2025 16:45",
      user: "Admin",
      action: "Áp dụng phụ thu 3% cho điện tử thay vì 5%",
      type: "mua-ho",
      label: "Mua hộ",
    },
  ];

  const FeeBox = ({
    icon: Icon,
    title,
    bg,
    content,
    color,
  }: {
    icon: any;
    title: string;
    bg: string;
    content: React.ReactNode;
    color: string;
  }) => (
    <div className={`p-4 rounded-2xl ${bg} relative`}>
      {/* Title */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 font-semibold">
          <Icon className={`${color}`} />
          <span className={`${color}`}>{title}</span>
        </div>
        <EditOutlined className={`cursor-pointer hover:text-blue-600 ${color}`} />
      </div>

      {/* Content */}
      <div className="space-y-1 text-sm">{content}</div>
    </div>
  );

  return (
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        width={1000}
        title="Cài đặt Phí & Phụ thu"
        className="rounded-xl"
        centered
      >
        {/* Grid 2x2 cho các phí */}
        <div className="grid grid-cols-2 gap-4">
          <FeeBox
            icon={ShoppingCartOutlined}
            title="Phí Mua hộ"
            bg="bg-blue-50"
            color="text-blue-800"
            content={
              <>
                <div className="flex flex-row justify-between">
                  <p> Phí theo %:</p>
                  <b>
                    3% <span className="text-gray-500">(thay vì 5%)</span>
                  </b>
                </div>
                <div className="flex flex-row justify-between">
                  <p>Phí tối thiểu:</p> <b>30,000 VND</b>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="!mb-0">Trạng thái:</p>{" "}
                  <Tag color="green">Đang áp dụng</Tag>
                </div>
              </>
            }
          />

          <FeeBox
            icon={CreditCardOutlined}
            title="Phí Thanh toán"
            bg="bg-purple-50"
            color="text-purple-800"
            content={
              <>
                <div className="flex flex-row justify-between">
                  <p>Phí cố định:</p> <b>150 JPY/giao dịch</b>
                </div>
                <div className="flex flex-row justify-between">
                  <p>Phí tối thiểu:</p> <b>30,000 VND</b>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="!mb-0">Trạng thái:</p>{" "}
                  <Tag color="green">Đang áp dụng</Tag>
                </div>
              </>
            }
          />

          <FeeBox
            icon={CloseCircleOutlined}
            title="Phí Hủy đơn"
            bg="bg-red-50"
            color="text-red-800"
            content={
              <>
                <div className="flex flex-row justify-between">
                  <p>Phí cố định:</p> <b>50,000 VND</b>
                </div>
                <div className="flex flex-row justify-between">
                  <p>Phí theo %:</p> <b>1% giá trị đơn</b>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="!mb-0">Trạng thái:</p>{" "}
                  <Tag color="green">Đang áp dụng</Tag>
                </div>
              </>
            }
          />

          <FeeBox
            icon={SafetyCertificateOutlined}
            title="Bảo hiểm mặc định"
            bg="bg-green-50"
            color="text-green-800"
            content={
              <>
                <div className="flex flex-row justify-between">
                  <p>Gói bảo hiểm:</p> <b>Bảo hiểm toàn diện</b>
                </div>
                <div className="flex flex-row justify-between">
                  <p>Phí bảo hiểm:</p>
                  <b>
                    3% <span className="text-gray-500">(thay vì 5%)</span>
                  </b>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="!mb-0">Trạng thái:</p>{" "}
                  <Tag color="green">Đang áp dụng</Tag>
                </div>
              </>
            }
          />
        </div>

        {/* Bảng phụ thu */}
        <h3 className="text-lg font-semibold mb-2 !mt-2">
          Phụ thu theo Loại sản phẩm
        </h3>
        <Table
          dataSource={extraFees}
          pagination={false}
          rowKey={(r) => r.country + r.product}
          columns={[
            { title: "Quốc gia", dataIndex: "country" },
            { title: "Loại sản phẩm", dataIndex: "product" },
            { title: "Điều kiện giá", dataIndex: "condition" },
            { title: "Phụ thu riêng", dataIndex: "customFee" },
            { title: "Phụ thu mặc định", dataIndex: "defaultFee" },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (text) => <Tag color="green">{text}</Tag>,
            },
            {
              title: "Hành động",
              render: () => (
                <div className="flex gap-2">
                  <Button type="link">Sửa</Button>
                  <Button type="link" danger>
                    Xóa
                  </Button>
                </div>
              ),
            },
          ]}
        />

        {/* Lịch sử */}
        <h3 className="text-lg font-semibold !mt-2 mb-2">
          Lịch sử Thay đổi Cài đặt Phí
        </h3>
        <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
          {history.map((h, i) => (
            <div key={i} className="px-4 py-2 flex flex-col">
              <div className="flex justify-between">
                {/* Bên trái: time + user + action */}
                <div className="flex flex-col">
                  <span className="text-sm">
                    <span className="text-black font-semibold">{h.time}</span> -{" "}
                    <b className="text-gray-600">{h.user}</b>
                  </span>
                  <span className="text-sm text-gray-700">{h.action}</span>
                </div>

                {/* Bên phải: trạng thái ở giữa block */}
                <span
                  className={`self-center px-2 py-0.5 text-xs rounded-lg ${
                    h.type === "mua-ho"
                      ? "bg-blue-100 text-blue-700"
                      : h.type === "thanh-toan"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {h.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
