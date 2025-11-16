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
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { getListExchangRate, updateListExchangRate } from "../apis/setting";
import { CurrencyRate } from "@/types/setting";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

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
          currency_code: r.currency_code,
        })),
      });
      toast.success(t("settings.exchangeRateUpdateSuccess"));
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card
        title={
          <div className="text-base font-medium text-gray-800">
            {t("settings.financialSettings")}
          </div>
        }
        className="rounded-lg shadow-sm"
      >
        <div className="flex gap-3 mb-6 w-full">
          {rates &&
            rates.map((item: CurrencyRate, index) => {
              return (
                <div
                  key={item.currency_code}
                  className="flex items-start flex-col gap-1 flex-1"
                >
                  <label className="text-xs text-gray-600 mb-1">
                    1 {item.currency_code} = (VND)
                  </label>
                  <InputNumber
                    size="large"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value?.replace(/,/g, "") as any}
                    value={item.rate_to_vnd}
                    onChange={(value) => handleChangeRate(value, index)}
                    className="!w-full"
                  />

                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>
                      <FontAwesomeIcon
                        icon={faClock}
                        className="w-4 h-4 text-gray-500"
                      />
                      Cập nhật lần cuối:{" "}
                      {item.updated_at
                        ? dayjs(item.updated_at).format("DD/MM/YY")
                        : "-"}
                    </p>
                    <p>
                      <FontAwesomeIcon
                        icon={faUser}
                        className="w-4 h-4 text-gray-500"
                      />
                      Được cập nhật bởi:
                      <span className="font-semibold">{item.full_name}</span>
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="w-full mb-4">
          <Button
            size="large"
            onClick={() => router.push("/finance-management")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faUniversity} />}
          >
            <span className="text-sm">
              {t("settings.bankAccountManagement")}
            </span>
          </Button>
        </div>
        <div className="w-full flex justify-end">
          <Button type="primary" size="large" onClick={() => handleSave()}>
            {t("settings.saveExchangeRate")}
          </Button>
        </div>
      </Card>
      <Card
        title={
          <div className="text-base font-medium text-gray-800">
            {t("settings.serviceFeesSettings")}
          </div>
        }
        className="relative rounded-lg shadow-sm h-full"
      >
        <div className="pb-16">
        </div>

        <div className="bottom-4 left-4 right-4 flex flex-col gap-3">
          <Button
            size="large"
            onClick={() => router.push("/website-manage")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faGlobe} />}
          >
            <span className="text-sm">
              {t("settings.supportedWebsiteManagement")}
            </span>
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/fee-setting")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faTags} />}
          >
            <span className="text-sm">{t("settings.productTypesAndFees")}</span>
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/user-management")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faLayerGroup} />}
          >
            <span className="text-sm">
              {t("settings.customerCategoriesAndPolicies")}
            </span>
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/user-management")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faUsers} />}
          >
            <span className="text-sm">{t("settings.staffAndPermissions")}</span>
          </Button>
          <Button
            size="large"
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            onClick={() => router.push("/fee-setting")}
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faCog} />}
          >
            <span className="text-sm">{t("settings.goToFeeManagement")}</span>
          </Button>
        </div>
      </Card>

  
    </div>
  );
};

export default SettingsDetail;
