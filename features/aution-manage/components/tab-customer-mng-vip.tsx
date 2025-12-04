import React, { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { Table, Input, Select, Button, Tag, Space } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { SearchOutlined } from '@ant-design/icons';
import UnlockCustomerModal from './modal/unlock-customer-modal';

const { Option } = Select;

type CustomerStatus = 'Hoạt động' | 'Bị khóa' | string;

interface Customer {
  key: string;
  name: string;
  email: string;
  package: string;
  slot: string;
  violation: string;
  status: CustomerStatus;
}

/** Dữ liệu mẫu cho bảng */
const customerData: Customer[] = [
  {
    key: '1',
    name: 'Trần Thị B',
    email: 'tranb@email.com',
    package: 'VIP 2',
    slot: '48/50',
    violation: '0/3',
    status: 'Hoạt động',
  },
  {
    key: '2',
    name: 'Phạm Văn D',
    email: 'phamd@email.com',
    package: 'VIP 2',
    slot: '50/50',
    violation: '3/3',
    status: 'Bị khóa',
  },
  {
    key: '3',
    name: 'Nguyễn Văn A',
    email: 'nguyena@email.com',
    package: 'VIP 1',
    slot: '1/2',
    violation: '1/3',
    status: 'Hoạt động',
  },
];

// Hàm lấy Tag màu sắc theo trạng thái
const getStatusTag = (status: CustomerStatus) => {
  switch (status) {
    case 'Hoạt động':
      return <Tag color="green">Hoạt động</Tag>;
    case 'Bị khóa':
      return <Tag color="red">Bị khóa</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

export const TabCustomerManagementTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Mở Modal Mở khóa
  const handleUnlock = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Cột của bảng
  const columns: ColumnsType<Customer> = [
    {
      title: 'KHÁCH HÀNG',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Customer) => (
        <div className="font-semibold text-gray-700">
          {text}
          <div className="text-sm font-normal text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'GÓI',
      dataIndex: 'package',
      key: 'package',
      width: 100,
      render: (text: string) => (
        <Tag color="gold" className="font-semibold text-sm py-0.5 px-2">
          {text}
        </Tag>
      ),
    },
    {
      title: 'SLOT',
      dataIndex: 'slot',
      key: 'slot',
      width: 100,
      render: (text: string) => (
        <span className={text === '50/50' ? 'text-red-500 font-medium' : 'font-medium'}>
          {text}
        </span>
      ),
    },
    {
      title: 'VI PHẠM',
      dataIndex: 'violation',
      key: 'violation',
      width: 100,
      render: (text: string) => (
        <span className={text === '3/3' ? 'text-red-500 font-medium' : 'font-medium'}>
          {text}
        </span>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: CustomerStatus) => getStatusTag(status),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 150,
      render: (_: any, record: Customer) => (
        <Space size="middle">
          {record.status === 'Bị khóa' ? (
            <Button 
              type="primary" 
              onClick={() => handleUnlock(record)}
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
            >
              Mở khóa
            </Button>
          ) : (
            <Button className="border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-500">
              Chi tiết
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  // Custom row className để làm nổi bật hàng Bị khóa (Phạm Văn D)
  const getRowClassName = (record: Customer) => {
    return record.status === 'Bị khóa' ? 'bg-red-50/50' : 'hover:bg-gray-50';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* KHU VỰC BỘ LỌC */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Select defaultValue="all-package" className="w-[150px]">
          <Option value="all-package">Tất cả gói</Option>
          <Option value="vip1">VIP 1</Option>
          <Option value="vip2">VIP 2</Option>
        </Select>

        <Select defaultValue="all-status" className="w-[150px]">
          <Option value="all-status">Trạng thái</Option>
          <Option value="active">Hoạt động</Option>
          <Option value="locked">Bị khóa</Option>
        </Select>

        <Input
          placeholder="Tìm khách hàng..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="!w-[300px]"
        />
      </div>
      
      {/* BẢNG DỮ LIỆU */}
      <Table
        columns={columns}
        dataSource={customerData}
        pagination={false}
        scroll={{ x: 'max-content' }}
        rowClassName={getRowClassName} // Áp dụng style cho hàng
        className="custom-table-header [&_thead>tr>th]:bg-gray-50 [&_thead>tr>th]:text-gray-500 [&_thead>tr>th]:font-semibold"
      />

      {/* MODAL MỞ KHÓA */}
      <UnlockCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};