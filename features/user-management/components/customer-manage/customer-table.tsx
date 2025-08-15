import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CustomerRowActions from './customer-row-actions';
import CustomerTypeSelect from './customer-type-select';

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
  const columns: ColumnsType<Customer> = [
    {
      title: 'Tên Khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phân loại',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => <CustomerTypeSelect value={record.type} />,
    },
    {
      title: 'Sales phụ trách',
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: 'Công nợ (VND)',
      dataIndex: 'debt',
      key: 'debt',
      render: (value) => (
        <Text className={value > 0 ? 'text-red-500 font-semibold' : ''}>
          {value.toLocaleString('vi-VN')}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: () => <CustomerRowActions />,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Danh sách Khách hàng</h2>
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
}
