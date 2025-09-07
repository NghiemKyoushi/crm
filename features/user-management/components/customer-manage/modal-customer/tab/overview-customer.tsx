import { Button, Modal, Radio } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddressModal from "./modal/modal-overview-add-address";
import BankAccountModal from "./modal/modal-overview-add-bank";
import {
  addressModel,
  bankAccountModel,
  CustomerDetail,
} from "@/types/customer-type";
import AddSalesModal, { Employee } from "./modal/modal-sales-add";

interface OverviewTabProps {
  customer: CustomerDetail;
  handleSubmitDataAddressDetail: (data: addressModel) => void;
  handleSubmitDataBankDetail: (data: bankAccountModel) => void;
  handleSetDefaultAddress: (addressId: string) => void;
  handleSetDefaultBank: (bankId: string) => void;
  handleChangeSaleAdd: (saleInfo: Employee) => void;
}

export default function OverviewTab(props: OverviewTabProps) {
  const {
    customer,
    handleSubmitDataAddressDetail,
    handleSubmitDataBankDetail,
    handleSetDefaultAddress,
    handleChangeSaleAdd,
    handleSetDefaultBank,
  } = props;
  const { t } = useTranslation();
  const [isOpenAddress, setIsOpenAddress] = useState(false);
  const [isOpenBank, setIsOpenBank] = useState(false);
  const [isOpenSetDefault, setIsOpenSetDefault] = useState(false);
  const [isOpenSaleAdd, setIsOpenSaleAdd] = useState(false);
  const [isOpenSetDefaultBank, setIsOpenSetDefaultBank] = useState(false);

  const [selectedDefaultAddress, setSelectedDefaultAddress] = useState(
    customer.shipping_addresses.find((a) => a.is_default)?.id || ""
  );

  const [selectedDefaultBank, setSelectedDefaultBank] = useState(
    customer.bank_accounts.find((a) => a.default)?.id || ""
  );

  const handleSubmitDataAddress = (data: addressModel) => {
    handleSubmitDataAddressDetail(data);
    setTimeout(() => {
      setIsOpenAddress(false);
    }, 1000);
  };

  const handleSubmitDataBank = (data: bankAccountModel) => {
    handleSubmitDataBankDetail(data);
    setTimeout(() => {
      setIsOpenAddress(false);
    }, 1000);
  };

  const handleChangeDefaultAddress = () => {
    if (selectedDefaultAddress) {
      handleSetDefaultAddress(selectedDefaultAddress.toString());
      setIsOpenSetDefault(false);
    }
  };

  const handleChangeDefaultBank = () => {    
    if (selectedDefaultBank) {
      handleSetDefaultBank(selectedDefaultBank.toString());
      setIsOpenSetDefaultBank(false);
    }
  };

  const handleChangeSaleResponsibiity = (saleInfo: Employee) => {
    if (saleInfo) {
      setIsOpenSaleAdd(false);
      handleChangeSaleAdd(saleInfo);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-gray-500 text-sm">
            {t("customerManage.customerOverview.totalOrders")}
          </div>
          <div className="font-bold text-lg">{customer.total_orders}</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center mr-[1px]">
          <div className="text-gray-500 text-sm">
            {t("customerManage.customerOverview.totalSpent")}
          </div>
          <div className="font-bold text-lg">
            {customer.total_expenses.toLocaleString()}đ
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-gray-500 text-sm">
            {t("customerManage.customerOverview.currentDebt")}
          </div>
          <div className="font-bold text-lg text-red-600">
            {customer.debt_amount && customer.debt_amount.toLocaleString()}đ
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-4">
        {/* Thông tin địa chỉ */}
        <div className="!flex-7/12">
          <div className="bg-white shadow rounded p-4">
            <div className="flex gap-1 justify-between items-center mb-2">
              <span className="font-semibold">
                {t("customerManage.customerOverview.addressBook")}
              </span>
              <div>
                <Button
                  onClick={() => setIsOpenAddress(true)}
                  type="link"
                  className="text-blue-600 p-0"
                >
                  {t("customerManage.customerOverview.addAddress")}
                </Button>

                {customer.shipping_addresses.length > 0 && (
                  <Button
                    onClick={() => setIsOpenSetDefault(true)}
                    type="link"
                    className="text-blue-600 p-0"
                  >
                    +{t("customerManage.customerOverview.addDefaultAddress")}
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm">
              <div className="font-bold">Nhà riêng</div>
              {customer.shipping_addresses.length > 0 &&
                (() => {
                  const defaultAddress = customer.shipping_addresses.find(
                    (addr) => addr.is_default
                  );
                  return defaultAddress ? (
                    <>
                      <div>{defaultAddress.address}</div>
                      <div>{defaultAddress.phone_number}</div>
                    </>
                  ) : null;
                })()}

              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                {t("customerManage.customerOverview.default")}
              </span>
            </div>
          </div>
          <div className="bg-white shadow rounded p-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">
                {t("customerManage.customerOverview.bankAccount")}
              </span>
              <Button
                type="link"
                onClick={() => setIsOpenBank(true)}
                className="text-blue-600 p-0"
              >
                {t("customerManage.customerOverview.addBankAccount")}
              </Button>

              {customer.bank_accounts.length > 0 && (
                <Button
                  onClick={() => setIsOpenSetDefaultBank(true)}
                  type="link"
                  className="text-blue-600 p-0"
                >
                  {/* +{t("customerManage.customerOverview.addDefaultAddress")} */}
                  + Thêm tài khoản mặc định
                </Button>
              )}
            </div>
            <div className="text-sm">
              {customer.bank_accounts.length > 0 &&
                (() => {
                  const defaultBank = customer.bank_accounts.find(
                    (bank) => bank.default
                  );
                  return defaultBank ? (
                    <>
                      <div className="font-bold">{defaultBank.bank_name}</div>
                      <div>
                        {t("customerManage.customerOverview.accountNumber")}:{" "}
                        {defaultBank.account_number}
                      </div>
                      <div>
                        {t("customerManage.customerOverview.accountOwner")}:{" "}
                        {defaultBank.account_holder_name}
                      </div>
                    </>
                  ) : null;
                })()}
            </div>
          </div>
        </div>
        <div className="!flex-3/12 flex flex-col gap-4">
          <div className="bg-white shadow rounded p-4">
            <div className="font-semibold">
              {t("customerManage.customerOverview.contactInfo")}
            </div>
            <div className="text-sm">{customer.user_profile.full_name}</div>
            <div className="text-sm">{customer.user_profile.phone}</div>
          </div>

          <div className="bg-white shadow rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">
                {t("customerManage.customerOverview.assignedStaff")}
              </div>
              <div className="text-sm">{customer.sale_profile?.full_name}</div>
              <div className="text-xs text-gray-400">
                {customer.sale_profile?.job}
              </div>
            </div>
            <Button
              type="link"
              className="text-blue-600 p-0"
              onClick={() => setIsOpenSaleAdd(true)}
            >
              {t("customerManage.customerOverview.change")}
            </Button>
          </div>
        </div>
      </div>
      <AddressModal
        handleSubmitDataAddress={handleSubmitDataAddress}
        open={isOpenAddress}
        onClose={() => setIsOpenAddress(false)}
      />
      <BankAccountModal
        onSubmit={handleSubmitDataBank}
        open={isOpenBank}
        onClose={() => setIsOpenBank(false)}
      />
      <AddSalesModal
        open={isOpenSaleAdd}
        onClose={() => setIsOpenSaleAdd(false)}
        onSubmit={handleChangeSaleResponsibiity}
      />
      {/* <Modal
        title={t("customerManage.customerOverview.addDefaultAddress")}
        open={isOpenSetDefault}
        onCancel={() => setIsOpenSetDefault(false)}
        onOk={handleChangeDefaultAddress}
      >
        <div className="!max-h-72 !min-h-72 overflow-y-auto">
          <Radio.Group
            onChange={(e) => setSelectedDefaultAddress(e.target.value)}
            value={selectedDefaultAddress}
            className="!flex !flex-col !gap-2"
          >
            {customer.shipping_addresses.map((addr) => (
              <Radio key={addr.id} value={addr.id}>
                <div>
                  <div className="font-medium">{addr.address}</div>
                  <div className="text-xs text-gray-500">
                    {addr.phone_number}
                  </div>
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Modal>

      <Modal
        title={t("customerManage.customerOverview.addDefaultAddress")}
        open={isOpenSetDefaultBank}
        onCancel={() => setIsOpenSetDefaultBank(false)}
        onOk={handleChangeDefaultBank}
      >
        <div className="!max-h-72 !min-h-72 overflow-y-auto">
          <Radio.Group
            onChange={(e) => {
              setSelectedDefaultBank(e.target.value);
            }}
            value={selectedDefaultBank}
            className="!flex !flex-col !gap-2"
          >
            {customer.bank_accounts.map((addr) => (
              <Radio key={addr.id} value={addr.id}>
                <div>
                  <div className="font-medium">
                    {addr.account_holder_name}-{addr.bank_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {addr.account_number}
                  </div>
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Modal> */}
      <Modal
        title={t("customerManage.customerOverview.addDefaultAddress")}
        open={isOpenSetDefault}
        onCancel={() => setIsOpenSetDefault(false)}
        onOk={handleChangeDefaultAddress}
        centered
      >
        <div className="!max-h-72 !min-h-72 overflow-y-auto">
          <Radio.Group
            onChange={(e) => setSelectedDefaultAddress(e.target.value)}
            value={selectedDefaultAddress}
            className="!flex !flex-col !gap-3"
          >
            {customer.shipping_addresses.map((addr) => (
              <Radio key={addr.id} value={addr.id} className="!w-full">
                <div className="border border-gray-400 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="font-medium text-sm">{addr.address}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {addr.phone_number}
                  </div>
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Modal>

      <Modal
        title={t("customerManage.customerOverview.addDefaultBank")}
        open={isOpenSetDefaultBank}
        onCancel={() => setIsOpenSetDefaultBank(false)}
        onOk={handleChangeDefaultBank}
        centered
      >
        <div className="!max-h-72 !min-h-72 overflow-y-auto">
          <Radio.Group
            onChange={(e) => {
              console.log('e', e.target);
              
              setSelectedDefaultBank(e.target.value)
            }}
            value={selectedDefaultBank}
            className="!flex !flex-col !gap-3"
          >
            {customer.bank_accounts.map((addr) => (
              <Radio key={addr.id} value={addr.id} className="!w-full">
                <div className="border border-gray-400 rounded-lg p-2 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="font-medium text-sm">
                    {addr.account_holder_name} – {addr.bank_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {addr.account_number}
                  </div>
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
}
