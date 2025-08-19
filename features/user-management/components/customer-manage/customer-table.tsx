import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CustomerRowActions from './customer-row-actions';
import CustomerTypeSelect from './customer-type-select';
import TableComponent from '@/components/TableComponent';
import CustomerDetailModal from './modal-customer/modal-view-detail-customer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Customer {
  key: string;
  name: string;
  type: string;
  sales: string;
  debt: number;
}

const { Text } = Typography;

const data: Customer[] = [
  { key: '1', name: 'Nguyễn Văn A', type: 'VIP', sales: 'Trần Thị Bích', debt: 6100000 },
  { key: '2', name: 'Lê Thị D', type: 'Bạc', sales: 'Nguyễn Văn An', debt: 0 },
];

export default function CustomerTable() {
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const { t } = useTranslation();

  const handleClickPopupdetail =() =>{
    setIsOpenDetail(true);
  }
  const handleClosePopupdetail =() =>{
    setIsOpenDetail(false);
  }
  const columns: ColumnsType<Customer> = [
    {
      title: t("customerTable.name"),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t("customerTable.type"),
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => <CustomerTypeSelect value={record.type} />,
    },
    {
      title: t("customerTable.sales"),
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: t("customerTable.debt"),
      dataIndex: 'debt',
      key: 'debt',
      render: (value) => (
        <Text className={value > 0 ? 'text-red-500 font-semibold' : ''}>
          {value.toLocaleString('vi-VN')}
        </Text>
      ),
    },
    {
      title: t("customerTable.actions"),
      key: 'actions',
      render: () => <div className='cursor-pointer' onClick={()=> handleClickPopupdetail()}><CustomerRowActions /></div>,
    },
  ];

  const fakeCustomer = {
    name: "Nguyễn Văn A",
    totalOrders: 12,
    totalSpent: 12500000, // đơn vị VND
    debt: 2500000,
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    phone: "0909123456",
    email: "nguyenvana@example.com",
    salesPerson: "Trần Thị Bích",
    bank: {
      name: "Vietcombank",
      accountNumber: "012345678901",
      owner: "Nguyễn Văn A"
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Danh sách Khách hàng</h2>
      <TableComponent headerHeight={44} rowHeight={48}  columns={columns} dataSource={data} pagination={false} />
      <CustomerDetailModal customer={fakeCustomer} onClose={handleClosePopupdetail} visible= {isOpenDetail} />
    </div>
  );
}
