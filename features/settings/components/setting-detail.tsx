import React, { useEffect, useState } from "react";
import { Card, Input, Button, List, Typography, InputNumber } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUniversity,
  faGlobe,
  faTags,
  faUsers,
  faLayerGroup,
  faCog,
  faClock,
  faBan,
  faPhone,
  faMapMarked,
  faTeletype,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { getListExchangRate, updateListExchangRate } from "../apis/setting";
import { CurrencyRate } from "@/types/setting";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const SettingsDetail = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [rateList, setRateList] = useState<CurrencyRate[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>(rateList);

  const handleGetListRate = async () => {
    const listRateExchange = await getListExchangRate();
    setRateList(listRateExchange);
    setRates(listRateExchange);
  };

  useEffect(() => {
    handleGetListRate();
  }, []);

  const handleChangeRate = (value: number | null, index: number) => {
    setRates((prev) => {
      const newRates = [...prev];
      newRates[index] = {
        ...newRates[index],
        rate_to_vnd: value ?? 0,
      };
      return newRates;
    });
  };

  const handleSave = async () => {
    try {
      await updateListExchangRate({
        data: rates.map((r) => ({
          id: r.id, // cần id
          rate_to_vnd: r.rate_to_vnd,
          currency_code: r.currency_code
        })),
      });
      toast.success(t('settings.exchangeRateUpdateSuccess'));
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card
        title={<div className="text-[18px]">{t('settings.financialSettings')}</div>}
        className="rounded-2xl shadow-md"
      >

        <div className="flex gap-4 mb-3 w-full">
          {rates &&
            rates.map((item: CurrencyRate, index) => {
              return (
                <>
                  <div
                    key={item.currency_code}
                    className="flex items-start flex-col gap-0 flex-1"
                  >
                    <p className="!mb-1">1 {item.currency_code} = (VND)</p>
                    <InputNumber
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      value={item.rate_to_vnd}
                      onChange={(value) => handleChangeRate(value, index)}
                      className="!w-full"
                    />
                  </div>
                </>
              );
            })}
        </div>

        <div className="w-full mt-4 mb-4">
          <Button
            size="large"
            className="!w-full !border-0 !bg-gray-50 !hover:bg-gray-100 !font-medium !p-3 !flex items-center gap-2"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faUniversity} />}
          >
            <span className="text-left w-full">
              {t('settings.bankAccountManagement')}
            </span>
          </Button>
        </div>
        <div className="w-full flex justify-end mt-2 ">
          <Button
            type="primary"
            className="!font-medium"
            onClick={() => handleSave()}
          >
            {t('settings.saveExchangeRate')}
          </Button>
        </div>
      </Card>
      <Card
        title={<div className="text-[18px]">{t('settings.serviceFeesSettings')}</div>}
        className="relative rounded-2xl shadow-md h-full"
      >
        <div className="pb-16">
          <div className="text-gray-600 mb-3">
            {t('settings.serviceFeesDescription')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="list-disc pl-5 text-gray-700">
              <li>{t('settings.buyingFeeUS')}</li>
              <li>{t('settings.buyingFeeJP')}</li>
              <li>{t('settings.internationalShipping')}</li>
              <li>{t('settings.productSurcharge')}</li>
            </ul>
            <ul className="list-disc pl-5 text-gray-700">
              <li>{t('settings.reinforcementFee')}</li>
              <li>{t('settings.insuranceFee')}</li>
              <li>{t('settings.hanoiDeliveryFee')}</li>
              <li>{t('settings.storageFee')}</li>
            </ul>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            size="large"
            className="!w-full !justify-center !border-0 !bg-blue-50 !text-blue-600 hover:!bg-blue-100 !font-medium"
            type="dashed"
            onClick={() => router.push("/fee-setting")}
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faCog} />}
          >
            {t('settings.goToFeeManagement')}
          </Button>
        </div>
      </Card>

      <Card title={t('settings.orderOperationsSettings')} className="rounded-2xl shadow-md">
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              icon: faGlobe,
              text: t('settings.supportedWebsiteManagement'),
              url: "/website-manage",
            },
            {
              icon: faTags,
              text: t('settings.productTypesAndFees'),
              url: "/website-manage",
            },
          ]}
          className="!flex !flex-col !gap-1"
          renderItem={(item) => (
            <List.Item className="!cursor-pointer  !w-full !rounded-md !border-0  !bg-gray-50 !hover:bg-gray-100 !font-medium !mb-2 !h-12 !pl-2 ">
              <List.Item.Meta
                avatar={
                  <FontAwesomeIcon
                    className="w-4 h-4 mt-1 ml-2"
                    icon={item.icon}
                  />
                }
                title={
                  <div
                    onClick={() => router.push(item.url)}
                    className="text-[16px]"
                  >
                    {item.text}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={t('settings.userManagementSettings')}
        className="rounded-2xl shadow-md"
      >
        <List
          itemLayout="horizontal"
          dataSource={[
            { icon: faLayerGroup, text: t('settings.customerCategoriesAndPolicies') },
            { icon: faUsers, text: t('settings.staffAndPermissions') },
          ]}
          className="!flex !flex-col !gap-1 "
          renderItem={(item) => (
            <List.Item className="!cursor-pointer !w-full !rounded-md !border-0  !bg-gray-50 !hover:bg-gray-100 !font-medium !mb-2 !h-12 !pl-2 !text-base">
              <List.Item.Meta
                avatar={
                  <FontAwesomeIcon
                    className="w-4 h-4  mt-1 ml-2"
                    icon={item.icon}
                  />
                }
                title={<div className="text-[16px]">{item.text}</div>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default SettingsDetail;
