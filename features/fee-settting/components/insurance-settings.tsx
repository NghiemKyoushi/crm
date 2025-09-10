"use client";

import React, { useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";

interface InsurancePackage {
  key: string;
  name: string;
  description: string;
  feePercent: number;
  maxValue: number;
  active: boolean;
}

const InsuranceSettings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<InsurancePackage>();
  const [data, setData] = useState<InsurancePackage[]>([
    {
      key: "1",
      name: "Bảo hiểm cơ bản",
      description: "Bảo hiểm thất lạc, hư hỏng cơ bản",
      feePercent: 2,
      maxValue: 10000000,
      active: true,
    },
    {
      key: "2",
      name: "Bảo hiểm toàn diện",
      description: "Bảo hiểm toàn diện mọi rủi ro",
      feePercent: 5,
      maxValue: 50000000,
      active: true,
    },
  ]);

  const handleAdd = () => {
    form
      .validateFields()
      .then((values) => {
        const newPkg: InsurancePackage = {
          //   key: String(data.length + 1),
          ...values,
          active: true,
        };
        setData([...data, newPkg]);
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch(() => {});
  };

  const columns: ColumnsType<InsurancePackage> = [
    {
      title: "Tên gói bảo hiểm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Phí bảo hiểm (%)",
      dataIndex: "feePercent",
      key: "feePercent",
      render: (val) => `${val}%`,
    },
    {
      title: "Giá trị tối đa",
      dataIndex: "maxValue",
      key: "maxValue",
      render: (val) => val.toLocaleString("vi-VN") + " VND",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: () => (
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
    <div className=" bg-white rounded-lg ">
      <div>
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
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          
        />
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
            <InputNumber min={0} step={0.1} className="!w-full" />
          </Form.Item>
          <Form.Item
            name="maxValue"
            label="Giá trị tối đa bảo hiểm (VND)"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị tối đa" },
            ]}
          >
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" className="!bg-green-500" onClick={handleAdd}>
              Thêm gói bảo hiểm
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InsuranceSettings;
