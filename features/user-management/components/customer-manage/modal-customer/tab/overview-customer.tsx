import { Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddressModal from "./modal/modal-overview-add-address";
import BankAccountModal from "./modal/modal-overview-add-bank";
import { addressModel, bankAccountModel, CustomerDetail } from "@/types/customer-type";

interface OverviewTabProps {
  customer: CustomerDetail;
  handleSubmitDataAddressDetail:(data:addressModel)=>void;
  handleSubmitDataBankDetail: (data:bankAccountModel)=>void;
}
export default function OverviewTab(props: OverviewTabProps) {
  const { customer, handleSubmitDataAddressDetail , handleSubmitDataBankDetail} = props;
    const { t } = useTranslation();
  const [isOpenAddress, setIsOpenAddress] = useState(false);
  const [isOpenBank, setIsOpenBank] = useState(false);

  const handleSubmitDataAddress =(data: addressModel)=>{
    handleSubmitDataAddressDetail(data);
    setTimeout(()=>{
      setIsOpenAddress(false);
    }, 1000)
  }

  const handleSubmitDataBank =(data: bankAccountModel)=>{
    console.log('data', data);
    
    handleSubmitDataBankDetail(data);
    setTimeout(()=>{
      setIsOpenAddress(false);
    }, 1000)
  }
  return (
      <>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-gray-500 text-sm">{t("customerManage.customerOverview.totalOrders")}</div>
          <div className="font-bold text-lg">{customer.total_orders}</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center mr-[1px]">
          <div className="text-gray-500 text-sm">{t("customerManage.customerOverview.totalSpent")}</div>
          <div className="font-bold text-lg">
            {customer.total_expenses.toLocaleString()}đ
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-gray-500 text-sm">{t("customerManage.customerOverview.currentDebt")}</div>
          <div className="font-bold text-lg text-red-600">
            {customer.debt_amount.toLocaleString()}đ
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-4">
        {/* Thông tin địa chỉ */}
        <div className="!flex-7/12">
          <div className="bg-white shadow rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t("customerManage.customerOverview.addressBook")}</span>
              <Button onClick={()=> setIsOpenAddress(true)} type="link" className="text-blue-600 p-0">
                {t("customerManage.customerOverview.addAddress")}
              </Button>
            </div>
            <div className="text-sm">
              <div className="font-bold">Nhà riêng</div>
              {
                customer.shipping_addresses.length > 0 &&
                <>
                <div>{customer.shipping_addresses.at(-1)?.address}</div>
                <div>{customer.shipping_addresses.at(-1)?.phone_number}</div>
                </>
              }
             
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                {t("customerManage.customerOverview.default")}
              </span>
            </div>
          </div>
          <div className="bg-white shadow rounded p-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t("customerManage.customerOverview.bankAccount")}</span>
              <Button type="link" onClick={()=> setIsOpenBank(true)} className="text-blue-600 p-0">
                {t("customerManage.customerOverview.addBankAccount")}
              </Button>
            </div>
            <div className="text-sm">
            {
              customer.shipping_addresses.length !== 0 && 
           <>
            <div className="font-bold">{customer.bank_accounts.at(-1)?.bank_name}</div>
              <div>{t("customerManage.customerOverview.accountNumber")}: {customer.bank_accounts.at(-1)?.account_number}</div>
              <div>{t("customerManage.customerOverview.accountOwner")}: {customer.bank_accounts.at(-1)?.account_holder_name}</div> 
           </>
            }
              
            </div>
          </div>
        </div>

        {/* Thông tin liên hệ & nhân viên */}
        <div className="!flex-3/12 flex flex-col gap-4">
          <div className="bg-white shadow rounded p-4">
            <div className="font-semibold">{t("customerManage.customerOverview.contactInfo")}</div>
            <div className="text-sm">{customer.user_profile.full_name}</div>
            <div className="text-sm">{customer.user_profile.phone}</div>
          </div>

          <div className="bg-white shadow rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{t("customerManage.customerOverview.assignedStaff")}</div>
              <div className="text-sm">{customer.sale_profile.full_name}</div>
              <div className="text-xs text-gray-400">{customer.sale_profile.job}</div>
            </div>
            <Button type="link" className="text-blue-600 p-0">
              {t("customerManage.customerOverview.change")}
            </Button>
          </div>
        </div>
      </div>
      <AddressModal handleSubmitDataAddress={handleSubmitDataAddress} open={isOpenAddress} onClose={()=> setIsOpenAddress(false)}/>
      <BankAccountModal  onSubmit={handleSubmitDataBank} open={isOpenBank} onClose={()=> setIsOpenBank(false)}/>
    </>
  );
}
