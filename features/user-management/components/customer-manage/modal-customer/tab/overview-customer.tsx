import { Button } from "antd";
import { useTranslation } from "react-i18next";

interface OverviewTabProps {
  customer: {
    name: string;
    totalOrders: number;
    totalSpent: number;
    debt: number;
    address: string;
    phone: string;
    email: string;
    salesPerson: string;
    bank: {
      name: string;
      accountNumber: string;
      owner: string;
    };
  };
}
export default function OverviewTab(props: OverviewTabProps) {
  const { customer } = props;
    const { t } = useTranslation();

  return (
      <>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-gray-500 text-sm">{t("customerManage.customerOverview.totalOrders")}</div>
          <div className="font-bold text-lg">{customer.totalOrders}</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center mr-[1px]">
          <div className="text-gray-500 text-sm">{t("customerManage.customerOverview.totalSpent")}</div>
          <div className="font-bold text-lg">
            {customer.totalSpent.toLocaleString()}đ
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-gray-500 text-sm">{t("customerManage.customerOverview.currentDebt")}</div>
          <div className="font-bold text-lg text-red-600">
            {customer.debt.toLocaleString()}đ
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-4">
        {/* Thông tin địa chỉ */}
        <div className="!flex-7/12">
          <div className="bg-white shadow rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t("customerManage.customerOverview.addressBook")}</span>
              <Button type="link" className="text-blue-600 p-0">
                {t("customerManage.customerOverview.addAddress")}
              </Button>
            </div>
            <div className="text-sm">
              <div className="font-bold">Nhà riêng</div>
              <div>{customer.address}</div>
              <div>{customer.phone}</div>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                {t("customerManage.customerOverview.default")}
              </span>
            </div>
          </div>
          <div className="bg-white shadow rounded p-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t("customerManage.customerOverview.bankAccount")}</span>
              <Button type="link" className="text-blue-600 p-0">
                {t("customerManage.customerOverview.addBankAccount")}
              </Button>
            </div>
            <div className="text-sm">
              <div className="font-bold">{customer.bank.name}</div>
              <div>{t("customerManage.customerOverview.accountNumber")}: {customer.bank.accountNumber}</div>
              <div>{t("customerManage.customerOverview.accountOwner")}: {customer.bank.owner}</div>
            </div>
          </div>
        </div>

        {/* Thông tin liên hệ & nhân viên */}
        <div className="!flex-3/12 flex flex-col gap-4">
          <div className="bg-white shadow rounded p-4">
            <div className="font-semibold">{t("customerManage.customerOverview.contactInfo")}</div>
            <div className="text-sm">{customer.email}</div>
            <div className="text-sm">{customer.phone}</div>
          </div>

          <div className="bg-white shadow rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{t("customerManage.customerOverview.assignedStaff")}</div>
              <div className="text-sm">{customer.salesPerson}</div>
              <div className="text-xs text-gray-400">Sales Manager</div>
            </div>
            <Button type="link" className="text-blue-600 p-0">
              {t("customerManage.customerOverview.change")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
