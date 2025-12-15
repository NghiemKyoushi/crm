import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Input, Select, Button, Tag, Space, Spin, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAuctionVipCustomers } from '../hooks/aution-manage';
import TableComponent from '@/components/TableComponent';
import { blockOrUnblockAuctionVipCustomer, fetchAuctionVipCustomers } from '../apis/aution-manage';
import { getVipPackages } from '@/features/vip-management/apis/vip-api';

const { Option } = Select;

type CustomerStatus = 'Hoạt động' | 'Bị khóa' | string;

// Thêm kiểu cho options của gói VIP
interface VipPackageOption {
  value: string;
  label: string;
}

interface CustomerRow {
  key: string | number;
  name: string;
  email: string;
  package: string;
  slot: string;
  violation: string;
  status: CustomerStatus;      // "Hoạt động" | "Bị khóa"
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

const STATUS_OPTIONS = [
  { value: '', label: "Tất cả trạng thái" },
  { value: 'active', label: "Hoạt động" },
  { value: 'blocked', label: "Bị khóa" },
];

export const TabCustomerManagementTable: React.FC = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);

  // PAGINATION state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // --- Search & Status filter states ---
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [inputSearch, setInputSearch] = useState<string>('');
  const [searchSpinning, setSearchSpinning] = useState<boolean>(false);

  // Gói VIP filter
  const [vipId, setVipId] = useState<string>(''); // '' = Tất cả gói

  // Danh sách các gói VIP lấy từ API
  const [vipPackages, setVipPackages] = useState<VipPackageOption[]>([
    { value: '', label: 'Tất cả gói' }
  ]);
  const [vipLoading, setVipLoading] = useState<boolean>(false);

  // Lấy danh sách các gói VIP khi mount
  useEffect(() => {
    const fetchVipPackages = async () => {
      setVipLoading(true);
      try {
        // Gọi API customers, nhưng chỉ lấy unique VIP packages
        const res = await getVipPackages();
        const vips: Array<{ vip_id: string, vip_name: string }> = (res || [])
          .map((x: any) => ({ vip_id: x.id, vip_name: x.name }))

        // Lọc ra duy nhất
        const uniqueVipMap: Record<string, string> = {};
        vips.forEach(x => {
          uniqueVipMap[x.vip_id] = x.vip_name;
        });

        const options: VipPackageOption[] = [{ value: '', label: 'Tất cả gói' }]
          .concat(
            Object.entries(uniqueVipMap).map(([id, name]) => ({
              value: id,
              label: name
            }))
          );

        setVipPackages(options);
      } catch {
        setVipPackages([{ value: '', label: 'Tất cả gói' }]);
      }
      setVipLoading(false);
    };

    fetchVipPackages();
  }, []);

  // debounce ref
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy data từ API có filter theo vipId
  const { data, isLoading, refetch } = useAuctionVipCustomers({
    page: currentPage,
    size: pageSize,
    vipId: vipId || undefined, // Nếu chọn tất cả thì không gửi lên filter
  });

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

  // Xử lý search input debounce
  const handleInputSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputSearch(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setSearchSpinning(true);

    debounceTimeoutRef.current = setTimeout(() => {
      setSearch(value);
      setSearchSpinning(false);
    }, 400);
  };

  // Xử lý chọn status filter, search luôn với giá trị input search hiện tại
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setSearch(inputSearch);
  };

  // Xử lý chọn filter package (VIP)
  const handleVipPackageChange = (value: string) => {
    setVipId(value);
    setCurrentPage(0); // reset trang về đầu khi filter gói
  };

  // Filter trực tiếp ở FE nếu API không hỗ trợ search/status
  // Xử lý search theo tên/email + status khoá/mở khoá
  const filteredRows = useMemo(() => {
    let rows = customerRows;

    // Lọc theo search
    if (search && search.trim().length > 0) {
      const needle = search.trim().toLowerCase();
      rows = rows.filter(row =>
        row.name.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle)
      );
    }

    // Lọc theo status filter
    if (status === "active") {
      rows = rows.filter(row => row.status === "Hoạt động");
    } else if (status === "blocked") {
      rows = rows.filter(row => row.status === "Bị khóa");
    }

    return rows;
  }, [customerRows, search, status]);

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
        {/* Select cho gói VIP, không disabled. Dữ liệu lấy qua API */}
        <Select
          value={vipId}
          className="w-[150px]"
          loading={vipLoading}
          onChange={handleVipPackageChange}
        >
          {vipPackages.map(opt =>
            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
          )}
        </Select>

        <Select
          value={status}
          className="w-[150px]"
          onChange={handleStatusChange}
          allowClear={false}
        >
          <Option value="">Tất cả trạng thái</Option>
          <Option value="active">Hoạt động</Option>
          <Option value="blocked">Bị khóa</Option>
        </Select>

        <Input
          placeholder="Tìm khách hàng..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="!w-[300px]"
          value={inputSearch}
          onChange={handleInputSearch}
          allowClear
        />
      </div>
      <Spin spinning={isLoading || searchSpinning || vipLoading}>
        <TableComponent
          columns={columns}
          dataSource={filteredRows}
          scroll={{ x: 'max-content' }}
          rowClassName={getRowClassName}
          className="custom-table-header [&_thead>tr>th]:bg-gray-50 [&_thead>tr>th]:text-gray-500 [&_thead>tr>th]:font-semibold"
          onPageChange={handlePageChange}
          page={currentPage}
          response={data}
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