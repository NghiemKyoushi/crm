import { Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHeadset,
  faUsers,
  faLayerGroup,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import CustomerTable from "./customer-table";
import SalesPage from "../sale-manage/sales-page";
import StaffManagePage from "../staff-manage/staff-manage-page";
import CategoryCustomerPage from "../category-customer/category-page";
import RoleManagerPage from "../role-manage/role-manage-pages";
import { useTranslation } from "react-i18next";

export default function CustomerPage() {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <Tabs
        defaultActiveKey="1"
        tabBarGutter={30} 
        destroyInactiveTabPane

        items={[
          {
            key: "1",
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} />
                {t("tabs.customer")}
              </span>
            ),
            children: <CustomerTable />,
          },
          {
            key: "2",
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHeadset} />
                {t("tabs.sales")}
              </span>
            ),
            children: <SalesPage />,
          },
          {
            key: "3",
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} />
                {t("tabs.staff")}
              </span>
            ),
            children: <StaffManagePage />,
          },
          {
            key: "4",
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLayerGroup} />
                {t("tabs.categoryCustomer")}
              </span>
            ),
            children: <CategoryCustomerPage />,
          },
          {
            key: "5",
            label: (
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUserShield} />
                {t("tabs.role")}
              </span>
            ),
            children: <RoleManagerPage />,
          },
        ]}
      />
    </div>
  );
}
