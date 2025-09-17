"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import TableComponent from "@/components/TableComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface InsurancePackage {
  key: string;
  name: string;
  description: string;
  feePercent: number | string;
  compensation: string; // bồi thường tối đa
  status: "Mặc định" | "Hoạt động" | "Tạm dừng";
}

const InsuranceSettings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  const [form] = Form.useForm<InsurancePackage>();
  const [data, setData] = useState<InsurancePackage[]>([
    {
      key: "1",
      name: "Không mua bảo hiểm",
      description: `Bồi thường hạn chế:
- Hư hỏng một phần: Theo % hư hỏng
- Mất hàng tuyến Mỹ: Tối đa 100 USD/sản phẩm
- Mất hàng tuyến Nhật: Tối đa 1 triệu VND/sản phẩm`,
      feePercent: "0%",
      compensation: "Mỹ: 100 USD/sp\nNhật: 1 triệu VND/sp",
      status: "Mặc định",
    },
    {
      key: "2",
      name: "Bảo hiểm hàng giá trị cao",
      description: `Dành cho hàng giá trị cao:
- Hư hỏng một phần: Theo % hư hỏng
- Mất hàng: 100% giá trị (có hóa đơn)
- Yêu cầu hóa đơn chứng minh giá trị`,
      feePercent: "3%",
      compensation: "100% giá trị",
      status: "Hoạt động",
    },
    {
      key: "3",
      name: "Bảo hiểm đặc biệt",
      description: `Dành cho hàng có yêu cầu đặc biệt
(Cần thảo luận riêng với khách hàng)`,
      feePercent: "Tùy chỉnh",
      compensation: "Tùy chỉnh",
      status: "Tạm dừng",
    },
  ]);

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleAdd = () => {
    form
      .validateFields()
      .then((values) => {
        const newPkg: InsurancePackage = {
          // key: String(data.length + 1),
          ...values,
          status: "Hoạt động",
        };
        setData([...data, newPkg]);
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch(() => {});
  };

  const columns: ColumnsType<InsurancePackage> = [
    {
      title: "Loại Bảo hiểm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả chi tiết",
      dataIndex: "description",
      key: "description",
      render: (val: string) => (
        <div className="text-sm max-w-xs whitespace-pre-line break-words">
          {val}
        </div>
      ),
    },
    {
      title: "Phí bảo hiểm",
      dataIndex: "feePercent",
      key: "feePercent",
    },
    {
      title: "Bồi thường tối đa",
      dataIndex: "compensation",
      key: "compensation",
      render: (val: string) => (
        <span className="text-green-600 whitespace-pre-line">{val}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        switch (status) {
          case "Mặc định":
            return <Tag color="blue">{status}</Tag>;
          case "Hoạt động":
            return <Tag color="green">{status}</Tag>;
          case "Tạm dừng":
            return <Tag color="default">{status}</Tag>;
          default:
            return <Tag>{status}</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="primary" size="small">
            Sửa
          </Button>
          <Button danger size="small">
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Cài đặt Bảo hiểm</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!bg-green-500"
          onClick={() => setIsModalOpen(true)}
        >
          Thêm gói bảo hiểm
        </Button>
      </div>{" "}
      <div className="flex gap-3 p-4 mb-4 border-l-4 border-red-500 bg-red-50 rounded">
        {/* Icon */}
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-red-500 text-lg mt-1"
        />

        {/* Nội dung */}
        <div>
          <h4 className="font-semibold text-red-600 mb-1">Lưu ý về Bảo hiểm</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>
              Dream Cargo <b>KHÔNG</b> bảo hiểm: hàng dễ vỡ (gốm, thủy tinh),
              hàng không chứng minh được nguồn gốc, hàng cấm
            </li>
            <li>Yêu cầu khách hàng quay video khi mở hàng để làm bằng chứng</li>
            <li> Khiếu nại phải được gửi trong vòng 24h sau khi nhận hàng</li>
          </ul>
        </div>
      </div>
      {/* Header + button */}
      {/* Table */}
      <TableComponent
        columns={columns}
        dataSource={data || []}
        rowHeight={45}
        pageSize={10}
        page={0}
        onPageChange={handleChangePage}
        response={undefined}
        fontSize={14}
        headerHeight={44}
      />
      {/* Footer save */}
      <div className="flex justify-end mt-4">
        <Button type="primary" className="!bg-blue-500">
          Lưu tất cả thay đổi
        </Button>
      </div>
      {/* Modal thêm bảo hiểm */}
      <Modal
        title="Thêm Gói bảo hiểm mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên gói bảo hiểm"
            rules={[
              { required: true, message: "Vui lòng nhập tên gói bảo hiểm" },
            ]}
          >
            <Input placeholder="Ví dụ: Bảo hiểm VIP" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả chi tiết về phạm vi bảo hiểm"
            />
          </Form.Item>
          <Form.Item
            name="feePercent"
            label="Phí bảo hiểm (%)"
            rules={[{ required: true, message: "Vui lòng nhập phí bảo hiểm" }]}
          >
            <Input placeholder="Ví dụ: 2% hoặc 3%" />
          </Form.Item>
          <Form.Item
            name="compensation"
            label="Bồi thường tối đa"
            rules={[
              { required: true, message: "Vui lòng nhập mức bồi thường" },
            ]}
          >
            <Input placeholder="Ví dụ: 100% giá trị hoặc tối đa 100 USD/sp" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              className="!bg-green-500"
              onClick={handleAdd}
            >
              Thêm gói bảo hiểm
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InsuranceSettings;
