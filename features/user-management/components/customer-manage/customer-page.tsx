import { Tabs } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHeadset,
  faUsers,
  faLayerGroup,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import CustomerTable from './customer-table';
import SalesPage from '../sale-manage/sales-page';
import StaffManagePage from '../staff-manage/staff-manage-page';

export default function CustomerPage() {
  return (
    <div className="p-4">
      <Tabs
        defaultActiveKey="1"
        tabBarGutter={32} // khoảng cách giữa các tab
        items={[
          {
            key: '1',
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} />
                Quản lý Khách hàng
              </span>
            ),
            children: <CustomerTable />,
          },
          {
            key: '2',
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHeadset} />
                Quản lý Sales
              </span>
            ),
            children: <SalesPage />,
          },
          {
            key: '3',
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} />
                  Quản lý Nhân viên 
              </span>
            ),
            children: <StaffManagePage/>,
          },
          {
            key: '4',
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLayerGroup} />
                Phân loại khách hàng
              </span>
            ),
            children: 'Phân loại content',
          },
          {
            key: '5',
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUserShield} />
                Vai trò & phân quyền
              </span>
            ),
            children: 'Vai trò content',
          },
        ]}
      />
    </div>
  );
}
