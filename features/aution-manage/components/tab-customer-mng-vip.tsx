import React, { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Input, Select, Button, Tag, Space, Spin, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAuctionVipCustomers } from '../hooks/aution-manage';
import TableComponent from '@/components/TableComponent';
import { blockOrUnblockAuctionVipCustomer } from '../apis/aution-manage';

const { Option } = Select;

type CustomerStatus = 'Hoạt động' | 'Bị khóa' | string;

interface CustomerRow {
  key: string | number;
  name: string;
  email: string;
  package: string;
  slot: string;
  violation: string;
  status: CustomerStatus;
  is_blocked: boolean;
  // Keep full original data in record for action
  __raw: any;
}

// Hàm chuyển trạng thái từ API sang text và tag màu
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

const mapAPIToCustomerRow = (item: any)=> {
  return {
    key: item.user_id,
    name: item.full_name,
    email: item.email,
    package: item.vip_name,
    slot: `${item.slot_used}/${item.slot_total}`,
    violation: `${item.violation_count}/3`,
    status: item.is_blocked ? 'Bị khóa' : 'Hoạt động',
    is_blocked: !!item.is_blocked,
    __raw: item
  };
};

export const TabCustomerManagementTable: React.FC = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);

  // PAGINATION state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // --- Lấy data từ API ---
  const { data, isLoading, refetch } = useAuctionVipCustomers({ page: currentPage, size: pageSize });
  const items = data?.items || [];
  const customerRows: CustomerRow[] = items.map(mapAPIToCustomerRow);

  // Lấy total (nếu có)
  const totalItems = data?.total || 0;

  // Mở Modal xác nhận khoá/mở khoá
  const handleLockOrUnlock = (customer: CustomerRow) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Gọi API khi xác nhận
  const handleConfirmLockOrUnlock = async () => {
    if (!selectedCustomer) return;
    setModalLoading(true);
    try {
      const userId = selectedCustomer.key;
      // Nếu đang bị khoá => mở khoá, ngược lại là khoá
      const blocked = !selectedCustomer.is_blocked ? true : false;
      await blockOrUnblockAuctionVipCustomer(userId, blocked);
      message.success(
        blocked
          ? `Khoá khách hàng thành công`
          : `Mở khoá khách hàng thành công`
      );
      setIsModalOpen(false);
      setSelectedCustomer(null);
      refetch?.();
    } catch (e: any) {
      message.error('Thao tác thất bại!');
    }
    setModalLoading(false);
  };

  // Cột của bảng
  const columns: ColumnsType<CustomerRow> = [
    {
      title: 'KHÁCH HÀNG',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CustomerRow) => (
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
      width: 150,
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
      width: 150,
      render: (text: string, record: CustomerRow) => {
        // Đỏ nếu đã full slot
        const slotUsed = Number(text.split('/')[0]);
        const slotTotal = Number(text.split('/')[1]);
        return (
          <span className={slotUsed === slotTotal ? 'text-red-500 font-medium' : 'font-medium'}>
            {text}
          </span>
        );
      },
    },
    {
      title: 'VI PHẠM',
      dataIndex: 'violation',
      key: 'violation',
      width: 150,
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
      render: (_: any, record: CustomerRow) => (
        <Space size="middle">
          <Button
            type={record.is_blocked ? "primary" : "default"}
            danger={!record.is_blocked}
            onClick={() => handleLockOrUnlock(record)}
            className={
              record.is_blocked
                ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
                : "border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500"
            }
          >
            {record.is_blocked ? 'Mở khóa' : 'Khóa'}
          </Button>
        </Space>
      ),
    },
  ];

  // Custom row className để làm nổi bật hàng Bị khóa
  const getRowClassName = (record: CustomerRow) => {
    return record.status === 'Bị khóa' ? 'bg-red-50/50' : 'hover:bg-gray-50';
  };

  // Handler cho đổi trang
  const handlePageChange = (page: number, pageSizeParam?: number) => {
    setCurrentPage(page);
    if (pageSizeParam && pageSizeParam !== pageSize) {
      setPageSize(pageSizeParam);
    }
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
      <Spin spinning={isLoading}>
        <TableComponent
          columns={columns}
          dataSource={customerRows}
          scroll={{ x: 'max-content' }}
          rowClassName={getRowClassName}
          className="custom-table-header [&_thead>tr>th]:bg-gray-50 [&_thead>tr>th]:text-gray-500 [&_thead>tr>th]:font-semibold"
          onPageChange={handlePageChange}
          page={currentPage}
          response={items}
        />
      </Spin>

      {/* Modal xác nhận khoá/mở khoá */}
      <Modal
        open={isModalOpen}
        title={selectedCustomer?.is_blocked ? "Xác nhận mở khoá" : "Xác nhận khoá"}
        okText={selectedCustomer?.is_blocked ? "Mở khoá" : "Khoá"}
        okType={selectedCustomer?.is_blocked ? "primary" : "danger"}
        cancelText="Huỷ"
        onOk={handleConfirmLockOrUnlock}
        confirmLoading={modalLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
      >
        <div>
          {selectedCustomer?.is_blocked
            ? `Bạn có chắc chắn muốn mở khoá khách hàng "${selectedCustomer?.name}"?`
            : `Bạn có chắc chắn muốn khoá khách hàng "${selectedCustomer?.name}"?`}
        </div>
      </Modal>
    </div>
  );
};