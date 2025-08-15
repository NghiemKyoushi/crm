'use client';

import { Tabs } from 'antd';
import CustomerTable from './customer-table';
import SalesPage from '../sale-manage/sales-page';

export default function CustomerPage() {
  return (
    <div className="p-4">
      <Tabs
        defaultActiveKey="1"
        items={[
          { key: '1', label: 'Quản lý Khách hàng', children: <CustomerTable /> },
          { key: '2', label: 'Quản lý Sales', children: <SalesPage/> },
          { key: '3', label: 'Nhân viên & Vai trò', children: 'Nhân viên content' },
        ]}
      />
    </div>
  );
}
