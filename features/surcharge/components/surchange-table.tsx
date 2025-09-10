import React, { useState } from "react";
import { Tabs, Table, Tag, Button, Space, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TableComponent from "@/components/TableComponent";
import AddSurchargeModal from "./modal/add-surcharge-modal";
import AddProductTypeModal from "./modal/add-product-type-modal";

interface SurchargeItem {
  key: string;
  productType: string;
  condition: string;
  fromPrice: number;
  toPrice?: number;
  surcharge: number;
  status: "Hoạt động" | "Không hoạt động";
}

const surchargeDataJapan: SurchargeItem[] = [
  {
    key: "1",
    productType: "Điện tử",
    condition: "≥ Lớn hơn hoặc bằng",
    fromPrice: 50000,
    surcharge: 5,
    status: "Hoạt động",
  },
  {
    key: "2",
    productType: "Quần áo",
    condition: "Khoảng",
    fromPrice: 10000,
    toPrice: 30000,
    surcharge: 2,
    status: "Hoạt động",
  },
  {
    key: "3",
    productType: "Mỹ phẩm",
    condition: "≥ Lớn hơn hoặc bằng",
    fromPrice: 5000,
    surcharge: 1,
    status: "Hoạt động",
  },
];

const SurchargeTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("japan");
  const [page, setPage] = useState(0);
  const [isOpenAddSurchange, setIsOpenAddSurchange] = useState(false);
  const [isOpenAddTypeProduct, setIsOpenAddTypeProduct] = useState(false);

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };
  const columns = [
    {
      title: "Loại sản phẩm",
      dataIndex: "productType",
      key: "productType",
    },
    {
      title: "Điều kiện giá",
      dataIndex: "condition",
      key: "condition",
      render: (value: string) => (
        <Tag color="blue" className="rounded-full px-3 py-1">
          {value}
        </Tag>
      ),
    },
    {
      title: "Từ giá (JPY)",
      dataIndex: "fromPrice",
      key: "fromPrice",
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: "Đến giá (JPY)",
      dataIndex: "toPrice",
      key: "toPrice",
      render: (value?: number) => (value ? value.toLocaleString() : "-"),
    },
    {
      title: "Phụ thu (%)",
      dataIndex: "surcharge",
      key: "surcharge",
      render: (value: number) => (
        <span
          className={
            value > 3
              ? "text-red-500"
              : value > 1
              ? "text-yellow-500"
              : "text-green-600"
          }
        >
          {value}%
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={value === "Hoạt động" ? "green" : "red"}>{value}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Space>
          <Button type="primary" size="small">
            Sửa
          </Button>
          <Button danger size="small">
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">
          Bảng Giá Phụ thu theo Loại sản phẩm
        </h2>

        <Space>
          <Button
            type="primary"
            onClick={() => setIsOpenAddTypeProduct(true)}
            icon={<PlusOutlined />}
          >
            Thêm Loại sản phẩm
          </Button>
          <Button type="link">Quay lại Cài đặt</Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        message={
          <div>
            <strong className="text-yellow-800">Thông tin về Phụ thu:</strong>
            <div className="text-yellow-700">
              Đây là bảng phụ thu mặc định theo giá sản phẩm và loại sản phẩm,
              được cài đặt riêng cho từng quốc gia (Japan/US).
            </div>
            <div className="text-yellow-700">
              <strong className="text-yellow-800">
                Phụ thu riêng cho từng khách hàng:
              </strong>{" "}
              Có thể được thiết lập trong trang <b>Chi tiết 360</b> của khách
              hàng, tab <b>Cài đặt Phí riêng</b>.
            </div>
          </div>
        }
        style={{
          background: "#fffce8",
          border: "1px solid #fdecb2",
          borderLeft: "4px solid #facc15",
        }}
      />
      <Tabs
        defaultActiveKey="japan"
        onChange={(key) => setActiveTab(key)}
        items={[
          { key: "japan", label: "Nhật Bản (Japan)" },
          { key: "us", label: "Hoa Kỳ (US)" },
        ]}
      />

      {/* Table */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            Bảng Phụ thu - {activeTab === "japan" ? "Nhật Bản" : "Hoa Kỳ"}
          </h3>
          <Button
            onClick={() => setIsOpenAddSurchange(true)}
            type="primary"
            icon={<PlusOutlined />}
          >
            Thêm Phụ thu
          </Button>
        </div>

        <TableComponent
          columns={columns}
          dataSource={surchargeDataJapan || []}
          rowHeight={45}
          pageSize={10}
          page={0}
          onPageChange={handleChangePage}
          response={undefined}
          fontSize={14}
          headerHeight={44}
        />
      </div>
      <AddSurchargeModal
        onCancel={() => setIsOpenAddSurchange(false)}
        onSubmit={(value) => {
          console.log(value);
        }}
        visible={isOpenAddSurchange}
      />
      <AddProductTypeModal
        onCancel={() => setIsOpenAddTypeProduct(false)}
        onSubmit={(value) => {
          console.log(value);
        }}
        visible={isOpenAddTypeProduct}
      />
    </div>
  );
};

export default SurchargeTable;
